export async function typeWriterEffect(
    fullText: string,
    onUpdate: (partial: string) => void,
    {
      minSpeed = 15,          // kecepatan minimum
      maxSpeed = 45,          // kecepatan maksimum
      sentencePause = 350,    // jeda antar kalimat
      cursorBlink = true,
    } = {}
  ) {
  
    let displayed = "";
    let cursor = cursorBlink ? "|" : "";
  
    function render(text: string) {
      onUpdate(text + cursor);
    }
  
    for (let i = 0; i < fullText.length; i++) {
      const char = fullText[i];
  
      displayed += char;
  
      // Render dengan cursor
      render(displayed);
  
      // Jeda antar kalimat (., ?, !)
      if (/[.!?]/.test(char)) {
        await new Promise(res => setTimeout(res, sentencePause));
      }
  
      // Random speed biar lebih natural
      const randomSpeed = Math.floor(Math.random() * (maxSpeed - minSpeed)) + minSpeed;
      await new Promise(res => setTimeout(res, randomSpeed));
    }
  
    // Hapus cursor setelah selesai
    if (cursorBlink) {
      render(displayed);
    }
  
    return displayed;
  }
  