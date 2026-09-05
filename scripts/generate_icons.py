import os
from PIL import Image, ImageDraw

def create_shield_icon(size):
    # Create RGBA image
    image = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    
    padding = size * 0.08
    w = size - 2 * padding
    h = size - 2 * padding
    
    # Shield shape points
    left = padding
    right = size - padding
    top = padding
    mid_x = size / 2
    bottom = size - padding
    control_y = top + h * 0.6
    
    # Shield polygon / path
    points = [
        (mid_x, top),
        (right, top + h * 0.15),
        (right, control_y),
        (mid_x, bottom),
        (left, control_y),
        (left, top + h * 0.15),
    ]
    
    # Draw Shield background (Modern Deep Blue / Indigo)
    shield_color = (37, 99, 235, 255) # #2563eb Blue
    border_color = (29, 78, 216, 255) # #1d4ed8 Darker Blue
    
    draw.polygon(points, fill=shield_color, outline=border_color)
    
    # Draw central Block slash / Cross / Checkmark
    if size >= 16:
        cx, cy = size / 2, size * 0.45
        r = size * 0.2
        stroke = max(1, int(size * 0.08))
        
        # Circle inside
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=(255, 255, 255, 230), width=stroke)
        # Diagonal slash inside circle (Block sign)
        draw.line([cx - r*0.6, cy - r*0.6, cx + r*0.6, cy + r*0.6], fill=(255, 255, 255, 230), width=stroke)

    return image

os.makedirs('/home/kali/chrome-exten/icons', exist_ok=True)

for s in [16, 48, 128]:
    img = create_shield_icon(s)
    img.save(f'/home/kali/chrome-exten/icons/icon-{s}.png')
    print(f'Generated icon-{s}.png successfully.')
