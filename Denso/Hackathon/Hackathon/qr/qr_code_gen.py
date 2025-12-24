import qrcode
import random
import json
from PIL import Image

def generate_random_box_data():
    """Generate random part box data"""
    part_types = ['bolt', 'bugi', 'car parts']
    box_types = ['plastic', 'cardboard', 'metal', 'wooden']

    data = {
        'part_contained': random.choice(part_types),
        'box_type': random.choice(box_types),
        'number_of_parts': random.randint(10, 500)
    }
    return data

def create_qr_code(data, size=300):
    """Create a QR code from data dictionary"""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=2,
    )

    json_data = json.dumps(data)
    qr.add_data(json_data)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    img = img.resize((size, size))

    return img

def create_grid_image(qr_images, grid_size=3, qr_size=300, gap=50):
    """Arrange QR codes in a grid with gaps"""
    total_width = (qr_size * grid_size) + (gap * (grid_size + 1))
    total_height = (qr_size * grid_size) + (gap * (grid_size + 1))

    grid_image = Image.new('RGB', (total_width, total_height), 'white')

    for idx, qr_img in enumerate(qr_images):
        row = idx // grid_size
        col = idx % grid_size

        x = gap + col * (qr_size + gap)
        y = gap + row * (qr_size + gap)

        grid_image.paste(qr_img, (x, y))

    return grid_image

def main():
    print("Generating 9 QR codes for part boxes...")

    qr_images = []
    box_data_list = []

    for i in range(9):
        box_data = generate_random_box_data()
        box_data_list.append(box_data)

        qr_img = create_qr_code(box_data, size=300)
        qr_images.append(qr_img)

        print(f"QR Code {i+1}: {box_data}")

    grid_image = create_grid_image(qr_images, grid_size=3, qr_size=300, gap=50)

    output_filename = 'part_box_qr_codes.png'
    grid_image.save(output_filename)

    print(f"\n✓ Successfully saved {output_filename}")
    print(f"  Image size: {grid_image.size[0]}x{grid_image.size[1]} pixels")
    print(f"  Grid: 3x3 with 50px gaps")

    with open('box_data.json', 'w') as f:
        json.dump(box_data_list, f, indent=2)
    print(f"✓ Box data saved to box_data.json")

if __name__ == "__main__":
    main()
