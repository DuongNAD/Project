from unsloth import FastLanguageModel
from datasets import load_dataset
import random

# 1. Cấu hình
model_path = "lora_model"
test_file  = "/mnt/e/LIVA_Finetune/Sentinel/test_dataset.jsonl"
max_seq_length = 2048
dtype = None
load_in_4bit = True

# 2. Load Model
print(f"⏳ Đang load model từ: {model_path}...")
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name = model_path,
    max_seq_length = max_seq_length,
    dtype = dtype,
    load_in_4bit = load_in_4bit,
)
FastLanguageModel.for_inference(model)

# 3. Load Dataset
print(f"📂 Đang đọc file đề thi: {test_file}")
dataset = load_dataset("json", data_files = test_file, split = "train")

# 4. Template
alpaca_prompt = """Below is an instruction that describes a task, paired with an input that provides further context. Write a response that appropriately completes the request.

### Instruction:
{}

### Input:
{}

### Response:
{}"""

def run_random_test(num_samples=10): 
    print(f"\n🤖 BẮT ĐẦU KIỂM TRA NGẪU NHIÊN {num_samples} CÂU")

    actual_samples = min(num_samples, len(dataset))
    indices = random.sample(range(len(dataset)), actual_samples)
    
    for idx in indices:
        item = dataset[idx]

        process = str(item.get('process_name') or 'N/A')
        cmd     = str(item.get('command_line') or 'N/A') 
        user    = str(item.get('user') or 'N/A')
        ground_truth = str(item.get('attack_category') or 'Unknown')
        
        instruction = "Analyze the following system log event and classify the activity."
        input_text = f"Process Name: {process}\nCommand Line: {cmd}\nUser: {user}"
        
        prompt = alpaca_prompt.format(instruction, input_text, "")
        
        inputs = tokenizer([prompt], return_tensors = "pt").to("cuda")
        outputs = model.generate(**inputs, max_new_tokens = 64, use_cache = True)
        decoded = tokenizer.batch_decode(outputs)[0]
        
        ai_response = decoded.split("### Response:")[-1].replace("<|eot_id|>", "").strip()

        is_correct = False
        if ai_response.lower() in ground_truth.lower() or ground_truth.lower() in ai_response.lower():
            is_correct = True

        if "suspicious" in ai_response.lower() and ground_truth.lower() != "benign":
             pass 

        print(f"\n🔹 Câu hỏi #{idx}:")
        print(f"   Input: {cmd[:100]}...") 
        print(f"   🎯 Đáp án: {ground_truth}")
        
        if is_correct:
            print(f"   🤖 AI:     \033[92m{ai_response} (CHÍNH XÁC)\033[0m")
        else:
            print(f"   🤖 AI:     \033[91m{ai_response} (SAI/LỆCH)\033[0m")
        print("-" * 30)

run_random_test(50) 