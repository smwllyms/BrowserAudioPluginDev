// bypass-processor.js script file, runs on AudioWorkletGlobalScope
class AudioProcessor extends AudioWorkletProcessor {
  constructor (options) {
    super();

    // For receiving update function
    this.port.onmessage = (e) => {
      let msg = e.data;

      if (msg.type === "code") {
        try {
          let args = ['inputs', 'outputs'];
          this.user_func = new Function(args, msg.data);
        }
        catch {}
      }
      else if (msg.type === "bypass") {
        this.bypassed = !this.bypassed;
      }
    }
  }
  
  process (inputs, outputs) {

      if (this.bypassed) {
        // Single input, single channel.
        const input = inputs[0];
        const output = outputs[0];
        output[0].set(input[0]);
        return true;
      }
      else {
        try {
          this.user_func(inputs, outputs);
          return true;
        }
        catch {
          return true;
        }
      }
  
      // Process only while there are active inputs.
      return true;
    }
  };
  
  registerProcessor('audio-processor', AudioProcessor);