import { isElementVisible } from './utils.js';

export function injectPidSimulator(containerElement) {
  containerElement.innerHTML = `
    <div class="embedded-sim-container">
      <div class="playground-layout">
        <!-- Display do Gráfico -->
        <div class="sim-display technical-card">
          <h4>[GRAFICO_DE_RESPOSTA_DO_SISTEMA]</h4>
          <canvas id="pid-canvas" width="550" height="200"></canvas>
          
          <div class="sim-controls">
            <div class="control-group">
              <label for="slider-kp" class="mono-text">Ganho Proporcional (Kp): <span id="val-kp">2.0</span></label>
              <input type="range" id="slider-kp" min="0" max="10" step="0.1" value="2.0">
            </div>
            <div class="control-group">
              <label for="slider-ki" class="mono-text">Ganho Integral (Ki): <span id="val-ki">0.50</span></label>
              <input type="range" id="slider-ki" min="0" max="5" step="0.05" value="0.50">
            </div>
            <div class="control-group">
              <label for="slider-kd" class="mono-text">Ganho Derivativo (Kd): <span id="val-kd">0.10</span></label>
              <input type="range" id="slider-kd" min="0" max="2" step="0.02" value="0.10">
            </div>
          </div>
        </div>

        <!-- Painel de Código Jupyter Style -->
        <div class="code-panel technical-card">
          <h4>[CODIGO_DO_LOOP_DE_CONTROLE]</h4>
          <pre><code>// Constantes PID atuais
double Kp = <span id="code-kp">2.0</span>;
double Ki = <span id="code-ki">0.5</span>;
double Kd = <span id="code-kd">0.1</span>;

double erro = setpoint - pressao;
integral += erro * dt;
double derivativo = (erro - erro_anterior) / dt;

double output = (Kp * erro) 
              + (Ki * integral) 
              + (Kd * derivativo);

acionarValvula(output);</code></pre>
        </div>
      </div>
    </div>
  `;

  const sliders = ['slider-kp', 'slider-ki', 'slider-kd'];
  sliders.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', drawSimulation);
  });

  setTimeout(drawSimulation, 50);
}

export function drawSimulation() {
  const canvas = document.getElementById('pid-canvas');
  if (!canvas) return;

  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  if (width > 0 && height > 0) {
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
  } else if (canvas.width === 0 || canvas.height === 0) {
    canvas.width = 500;
    canvas.height = 200;
  }

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const styles = getComputedStyle(document.documentElement);
  const colorBorder = styles.getPropertyValue('--border').trim() || '#dfdfdf';
  const colorPrimary = styles.getPropertyValue('--primary').trim() || '#72e3ad';

  ctx.strokeStyle = colorBorder;
  ctx.lineWidth = 1;
  for (let i = 50; i < canvas.width; i += 50) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, canvas.height);
    ctx.stroke();
  }
  for (let j = 50; j < canvas.height; j += 50) {
    ctx.beginPath();
    ctx.moveTo(0, j);
    ctx.lineTo(canvas.width, j);
    ctx.stroke();
  }

  const sliderKp = document.getElementById('slider-kp');
  const sliderKi = document.getElementById('slider-ki');
  const sliderKd = document.getElementById('slider-kd');

  const Kp = sliderKp ? parseFloat(sliderKp.value) : 2.0;
  const Ki = sliderKi ? parseFloat(sliderKi.value) : 0.5;
  const Kd = sliderKd ? parseFloat(sliderKd.value) : 0.1;

  const valKp = document.getElementById('val-kp');
  const valKi = document.getElementById('val-ki');
  const valKd = document.getElementById('val-kd');
  const codeKp = document.getElementById('code-kp');
  const codeKi = document.getElementById('code-ki');
  const codeKd = document.getElementById('code-kd');

  if (valKp) valKp.innerText = Kp.toFixed(1);
  if (valKi) valKi.innerText = Ki.toFixed(2);
  if (valKd) valKd.innerText = Kd.toFixed(2);
  if (codeKp) codeKp.innerText = Kp.toFixed(1);
  if (codeKi) codeKi.innerText = Ki.toFixed(2);
  if (codeKd) codeKd.innerText = Kd.toFixed(2);

  const setpoint = 120; // Alvo
  let processVal = 0;
  let processVelocity = 0;
  let erroAnterior = 0;
  let integral = 0;
  const dt = 0.1;
  const points = [];

  for (let t = 0; t < canvas.width; t++) {
    const erro = setpoint - processVal;
    integral += erro * dt;
    integral = Math.max(-50, Math.min(50, integral)); // anti-windup
    const derivativo = (erro - erroAnterior) / dt;
    erroAnterior = erro;

    let output = (Kp * erro) + (Ki * integral) + (Kd * derivativo);
    output = Math.max(0, Math.min(220, output)); // Saturação do ventilador

    // Modelo de elasticidade pulmonar com inércia (2ª ordem)
    const acc = (output * 0.12) - (processVal * 0.08) - (processVelocity * 0.45);
    processVelocity += acc * dt;
    processVal += processVelocity * dt;

    points.push(processVal);
  }

  ctx.strokeStyle = '#f59e0b';
  ctx.setLineDash([4, 4]);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, canvas.height - setpoint);
  ctx.lineTo(canvas.width, canvas.height - setpoint);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#f59e0b';
  ctx.font = '9px monospace';
  ctx.fillText("SETPOINT (PRESSÃO DESEJADA)", 15, canvas.height - setpoint - 6);

  ctx.strokeStyle = colorPrimary;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(0, canvas.height);
  for (let x = 0; x < points.length; x++) {
    const y = canvas.height - points[x];
    ctx.lineTo(x, y);
  }
  ctx.stroke();
}

export function initSimulator() {
  window.addEventListener('resize', () => {
    const canvas = document.getElementById('pid-canvas');
    if (canvas && isElementVisible(canvas)) {
      drawSimulation();
    }
  });

  window.injectPidSimulator = injectPidSimulator;
}
