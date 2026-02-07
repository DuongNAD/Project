from unsloth import FastLanguageModel
import torch
from trl import SFTTrainer
from transformers import TrainingArguments
from datasets import load_dataset
import os


max_seq_length = 2048   
dtype = None          
load_in_4bit = True    

model_path = "/mnt/e/LIVA_Finetune/models/Llama-3.1-8B-Instruct"
dataset_file = "/mnt/e/LIVA_Finetune/Sentinel/dataset_v3_advanced.jsonl"
test_output_file = "/mnt/e/LIVA_Finetune/Sentinel/test_dataset.jsonl"

print(f"🔄 Đang load model từ: {model_path}...")
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name = model_path,
    max_seq_length = max_seq_length,
    dtype = dtype,
    load_in_4bit = load_in_4bit,
)

model = FastLanguageModel.get_peft_model(
    model,
    r = 16, 
    target_modules = ["q_proj", "k_proj", "v_proj", "o_proj",
                      "gate_proj", "up_proj", "down_proj",],
    lora_alpha = 16,
    lora_dropout = 0, 
    bias = "none",    
    use_gradient_checkpointing = "unsloth", 
    random_state = 3407,
    use_rslora = False,  
    loftq_config = None, 
)

alpaca_prompt = """Below is an instruction that describes a task, paired with an input that provides further context. Write a response that appropriately completes the request.

### Instruction:
{}

### Input:
{}

### Response:
{}"""

EOS_TOKEN = tokenizer.eos_token 

def formatting_prompts_func(examples):

    process_names = examples["process_name"]
    command_lines = examples["command_line"]
    users         = examples["user"]
    outputs       = examples["attack_category"] 

    texts = []
    for process, cmd, user, output in zip(process_names, command_lines, users, outputs):

        instruction = "Analyze the following system log event and classify the activity."

        input_text = f"Process Name: {process}\nCommand Line: {cmd}\nUser: {user}"

        text = alpaca_prompt.format(instruction, input_text, output) + EOS_TOKEN
        texts.append(text)
        
    return { "text" : texts, }

print(f"🔄 Đang load dataset từ: {dataset_file}")
full_dataset = load_dataset("json", data_files = dataset_file, split = "train")

print("Chia dataset (80% Train - 20% Test)")
dataset_split = full_dataset.train_test_split(test_size=0.2, seed=42)
train_dataset = dataset_split["train"]
test_dataset  = dataset_split["test"]

print(f"Kết quả chia:")
print(f"   - Tập Train (Học): {len(train_dataset)} dòng")
print(f"   - Tập Test (Thi):  {len(test_dataset)} dòng")


print(f"Đang lưu tập Test vào file: {test_output_file}")
test_dataset.to_json(test_output_file)

print("Đang xử lý format dữ liệu cho tập Train...")
train_dataset = train_dataset.map(formatting_prompts_func, batched = True)

training_args = TrainingArguments(
    per_device_train_batch_size = 2, 
    gradient_accumulation_steps = 4, 
    warmup_steps = 5,

    num_train_epochs = 1, 
    
    learning_rate = 2e-4,
    fp16 = not torch.cuda.is_bf16_supported(),
    bf16 = torch.cuda.is_bf16_supported(),
    logging_steps = 1,
    optim = "adamw_8bit",
    weight_decay = 0.01,
    lr_scheduler_type = "linear",
    seed = 3407,
    output_dir = "outputs",
)

print("Bắt đầu huấn luyện (Fine-tuning)...")
trainer = SFTTrainer(
    model = model,
    tokenizer = tokenizer,
    train_dataset = train_dataset,
    dataset_text_field = "text",
    max_seq_length = max_seq_length,
    dataset_num_proc = 2,
    packing = False, 
    args = training_args,
)

trainer_stats = trainer.train()

print("Đang lưu model và adapters...")
model.save_pretrained("lora_model") 
tokenizer.save_pretrained("lora_model")

print("Fine-tuning hoàn tất!")