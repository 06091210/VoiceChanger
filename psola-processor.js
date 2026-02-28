class PSOLAProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffer = [];
    this.pitchFactor = 1.2; // ← ピッチ上げ率
  }

  process(inputs, outputs) {
    const input = inputs[0][0];
    const output = outputs[0][0];

    if (!input) return true;

    // 入力を保存
    this.buffer.push(...input);

    // 十分たまったら処理
    if (this.buffer.length > 2048) {
      const processed = this.psola(this.buffer);
      for (let i = 0; i < output.length; i++) {
        output[i] = processed[i] || 0;
      }
      this.buffer = [];
    }

    return true;
  }

  // 超簡易PSOLA（基本構造）
  psola(signal) {
    const period = this.detectPitch(signal);
    const newSignal = new Float32Array(signal.length);

    let writePos = 0;
    for (let i = 0; i < signal.length - period; i += period) {
      const chunk = signal.slice(i, i + period);
      for (let j = 0; j < chunk.length; j++) {
        newSignal[writePos + j] += chunk[j];
      }
      writePos += period / this.pitchFactor;
    }

    return newSignal;
  }

  // 超簡易ピッチ検出（自己相関）
  detectPitch(signal) {
    let bestOffset = 0;
    let bestCorr = 0;

    for (let offset = 20; offset < 200; offset++) {
      let corr = 0;
      for (let i = 0; i < signal.length - offset; i++) {
        corr += signal[i] * signal[i + offset];
      }
      if (corr > bestCorr) {
        bestCorr = corr;
        bestOffset = offset;
      }
    }
    return bestOffset || 100;
  }
}

registerProcessor('psola-processor', PSOLAProcessor);
