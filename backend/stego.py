import cv2
import numpy as np
import os

def string_to_bin(string):
    return ''.join(format(ord(char), '08b') for char in string)

def bin_to_string(binary):
    chars = [binary[i:i+8] for i in range(0, len(binary), 8)]
    return ''.join(chr(int(char, 2)) for char in chars if int(char, 2) != 0)

def embed_lsb(video_path, output_path, secret_data):
    """
    Embeds secret data into the Least Significant Bits (LSB) of the first frame's pixel data.
    """
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    
    # Use mp4v codec for standard mp4
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
    
    # Secret marker + data + End marker
    secret_payload = f"---SENTINEL-SIG---{secret_data}"
    secret_bin = string_to_bin(secret_payload) + '1111111111111110'
    data_len = len(secret_bin)
    
    frame_idx = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break
            
        if frame_idx == 0:
            idx = 0
            for i in range(frame.shape[0]):
                for j in range(frame.shape[1]):
                    for k in range(3):
                        if idx < data_len:
                            frame[i][j][k] = (frame[i][j][k] & ~1) | int(secret_bin[idx])
                            idx += 1
                        else:
                            break
                    if idx >= data_len: break
                if idx >= data_len: break
                
        out.write(frame)
        frame_idx += 1
        
    cap.release()
    out.release()
    
    # Dual-Embed: mp4v compression aggressively destroys LSB data.
    # To survive WhatsApp/Document transfers, we ALSO append the raw bytes.
    sig_marker = "---SENTINEL-SIG---"
    with open(output_path, "ab") as f:
        f.write(sig_marker.encode())
        f.write(secret_data.encode())
        
    return output_path

def extract_lsb(video_path):
    """
    Extracts secret data from the Least Significant Bits (LSB) of the first frame's pixel data.
    """
    cap = cv2.VideoCapture(video_path)
    ret, frame = cap.read()
    cap.release()
    
    if not ret:
        return None
        
    binary_data = ""
    for i in range(frame.shape[0]):
        for j in range(frame.shape[1]):
            for k in range(3):
                binary_data += str(frame[i][j][k] & 1)
                
    end_marker = '1111111111111110'
    marker_pos = binary_data.find(end_marker)
    
    if marker_pos != -1:
        secret_bin = binary_data[:marker_pos]
        extracted_payload = bin_to_string(secret_bin)
        
        sig_marker = "---SENTINEL-SIG---"
        if extracted_payload.startswith(sig_marker):
            return extracted_payload[len(sig_marker):]
            
    # LSB Failed (likely destroyed by lossy H.264/mp4v compression)
    # Fallback to Dual-Embed appended signature
    try:
        with open(video_path, "rb") as f:
            f.seek(0, os.SEEK_END)
            file_size = f.tell()
            # Read last 100 bytes
            seek_pos = max(0, file_size - 100)
            f.seek(seek_pos)
            tail_data = f.read()
            
            sig_marker = b"---SENTINEL-SIG---"
            marker_pos = tail_data.rfind(sig_marker)
            if marker_pos != -1:
                start = marker_pos + len(sig_marker)
                # The ID is the 16 bytes after the marker
                return tail_data[start:start+16].decode('utf-8', errors='ignore').strip()
    except Exception:
        pass
        
    return None
