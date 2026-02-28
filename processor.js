class VoiceEngine extends AudioWorkletProcessor {

  constructor(){
    super();
    this.pitchShift = 1;
    this.formantShift = 1;
    this.noiseAmount = 0;
    this.robotFreq = 0;
    this.drive = 1;

    this.buffer = new Float32Array(2048);
    this.bufIndex = 0;

    this.prev = 0;
    this.phase = 0;

    this.port.onmessage = e=>{
      this[e.data.param] = e.data.value;
    };
  }

  // --- YINピッチ検出 ---
  detectPitch(buffer){
    let tauMax = 1024;
    let minTau = 50;
    let bestTau = -1;
    let minDiff = 1e9;

    for(let tau=minTau;tau<tauMax;tau++){
      let diff=0;
      for(let i=0;i<tauMax;i++){
        let d = buffer[i] - buffer[i+tau];
        diff += d*d;
      }
      if(diff < minDiff){
        minDiff = diff;
        bestTau = tau;
      }
    }
    if(bestTau>0)
      return sampleRate / bestTau;
    return 0;
  }

  process(inputs,outputs){
    const input = inputs[0][0];
    const output = outputs[0][0];
    if(!input) return true;

    for(let i=0;i<input.length;i++){
      let s = input[i];

      // DC除去
      s = s - 0.995*this.prev;
      this.prev = s;

      // バッファ蓄積
      this.buffer[this.bufIndex++] = s;
      if(this.bufIndex >= 2048){
        this.currentPitch = this.detectPitch(this.buffer);
        this.bufIndex = 0;
      }

      // --- PSOLA簡易版 ---
      if(this.currentPitch){
        let period = sampleRate / this.currentPitch;
        let shiftedPeriod = period / this.pitchShift;
        let index = (this.phase % shiftedPeriod);
        s = this.buffer[Math.floor(index)] || s;
        this.phase += 1;
      }

      // --- フォルマント簡易 ---
      s *= this.formantShift;

      // --- ロボ ---
      if(this.robotFreq>0){
        this.phase += this.robotFreq/sampleRate;
        s *= Math.sin(2*Math.PI*this.phase);
      }

      // --- ノイズ ---
      s += (Math.random()*2-1)*this.noiseAmount;

      // --- 歪み ---
      s = Math.tanh(s*this.drive);

      // --- リミッタ ---
      if(s>1) s=1;
      if(s<-1) s=-1;

      output[i] = s;
    }

    return true;
  }
}

registerProcessor("voice-engine", VoiceEngine);
