const state = {
  port: null,
  reader: null,
  writer: null,
  textBuffer: "",
  connected: false,
  lastStatus: {},
  operationRecords: [],
  alarmRecords: [],
  historyRecords: [],
  lastAlarmKey: "NONE",
  production: {
    plannedMinutes: 30,
    targetWeightKg: 15,
    batchWeightKg: 0.5,
    batchPieces: 20,
    elapsedMs: 0,
    lastTickAt: null,
    completedBatches: 0,
    lastProcess: "IDLE",
    simulatorTick: 0
  },
  simulation: false,
  simulator: {
    MODE: "MANUAL",
    RUN: "0",
    PROC: "IDLE",
    ESTOP: "0",
    ALARM: "0",
    FAULT: "NONE",
    LIMC: "0",
    LIMR: "0",
    CV: "55",
    VB: "45",
    RL: "60",
    SEL: "CONVEYOR",
    saved: null,
    autoStep: 0
  }
};

const el = {
  loginGate: document.getElementById("loginGate"),
  loginForm: document.getElementById("loginForm"),
  loginUser: document.getElementById("loginUser"),
  loginPassword: document.getElementById("loginPassword"),
  loginError: document.getElementById("loginError"),
  copyAddressBtn: document.getElementById("copyAddressBtn"),
  loginCopyAddressBtn: document.getElementById("loginCopyAddressBtn"),
  openAddressLink: document.getElementById("openAddressLink"),
  loginOpenAddressLink: document.getElementById("loginOpenAddressLink"),
  logoutBtn: document.getElementById("logoutBtn"),
  closeWindowBtn: document.getElementById("closeWindowBtn"),
  closeDialog: document.getElementById("closeDialog"),
  confirmCloseBtn: document.getElementById("confirmCloseBtn"),
  cancelCloseBtn: document.getElementById("cancelCloseBtn"),
  viewTitle: document.getElementById("viewTitle"),
  sideConnectionText: document.getElementById("sideConnectionText"),
  portState: document.getElementById("portState"),
  connectionText: document.getElementById("connectionText"),
  baudRate: document.getElementById("baudRate"),
  connectBtn: document.getElementById("connectBtn"),
  disconnectBtn: document.getElementById("disconnectBtn"),
  runValue: document.getElementById("runValue"),
  modeValue: document.getElementById("modeValue"),
  processValue: document.getElementById("processValue"),
  alarmValue: document.getElementById("alarmValue"),
  faultValue: document.getElementById("faultValue"),
  estopValue: document.getElementById("estopValue"),
  limitConveyorValue: document.getElementById("limitConveyorValue"),
  limitRollerValue: document.getElementById("limitRollerValue"),
  selectedValue: document.getElementById("selectedValue"),
  lastUpdate: document.getElementById("lastUpdate"),
  ioUpdateTime: document.getElementById("ioUpdateTime"),
  logWindow: document.getElementById("logWindow"),
  manualCommand: document.getElementById("manualCommand"),
  manualSendForm: document.getElementById("manualSendForm"),
  manualBtn: document.getElementById("manualBtn"),
  autoBtn: document.getElementById("autoBtn"),
  simulateBtn: document.getElementById("simulateBtn"),
  simEStopBtn: document.getElementById("simEStopBtn"),
  simLimitConveyorBtn: document.getElementById("simLimitConveyorBtn"),
  simLimitRollerBtn: document.getElementById("simLimitRollerBtn"),
  simClearBtn: document.getElementById("simClearBtn"),
  resetProductionBtn: document.getElementById("resetProductionBtn"),
  plannedMinutesInput: document.getElementById("plannedMinutesInput"),
  targetWeightInput: document.getElementById("targetWeightInput"),
  batchWeightInput: document.getElementById("batchWeightInput"),
  batchPiecesInput: document.getElementById("batchPiecesInput"),
  progressFill: document.getElementById("progressFill"),
  progressPercentValue: document.getElementById("progressPercentValue"),
  plannedTimeValue: document.getElementById("plannedTimeValue"),
  elapsedTimeValue: document.getElementById("elapsedTimeValue"),
  remainingTimeValue: document.getElementById("remainingTimeValue"),
  completedBatchValue: document.getElementById("completedBatchValue"),
  completedWeightValue: document.getElementById("completedWeightValue"),
  completedPiecesValue: document.getElementById("completedPiecesValue"),
  conveyorRange: document.getElementById("conveyorRange"),
  conveyorInput: document.getElementById("conveyorInput"),
  vibratorRange: document.getElementById("vibratorRange"),
  vibratorInput: document.getElementById("vibratorInput"),
  rollerRange: document.getElementById("rollerRange"),
  rollerInput: document.getElementById("rollerInput"),
  conveyorGaugeValue: document.getElementById("conveyorGaugeValue"),
  vibratorGaugeValue: document.getElementById("vibratorGaugeValue"),
  rollerGaugeValue: document.getElementById("rollerGaugeValue"),
  conveyorGaugeFill: document.getElementById("conveyorGaugeFill"),
  vibratorGaugeFill: document.getElementById("vibratorGaugeFill"),
  rollerGaugeFill: document.getElementById("rollerGaugeFill"),
  operationRecordBody: document.getElementById("operationRecordBody"),
  alarmRecordBody: document.getElementById("alarmRecordBody"),
  historyRecordBody: document.getElementById("historyRecordBody"),
  historyFilter: document.getElementById("historyFilter"),
  currentAlarmSummary: document.getElementById("currentAlarmSummary"),
  alarmCountValue: document.getElementById("alarmCountValue")
};

const loginConfig = {
  user: "admin",
  password: "123456"
};

const viewTitles = {
  overview: "总控制界面",
  operate: "参数与 I/O",
  operations: "操作记录",
  alarms: "报警记录",
  history: "历史数据查询"
};

const statusLabels = {
  IDLE: "待机",
  FEED_TO_DRUM: "送料入滚筒",
  DRUM_SEPARATING: "滚筒分离",
  VIBRATORY_SORTING: "振动筛分",
  CYCLE_COMPLETE: "周期完成",
  NONE: "无",
  ESTOP: "急停",
  LIMIT_CONVEYOR: "传送带限位",
  LIMIT_ROLLER: "滚筒限位",
  RESET_BLOCKED: "复位受阻",
  STEPPER: "步进故障",
  CONVEYOR: "传送带",
  VIBRATOR: "振动盘",
  ROLLER: "滚筒",
  AUTO: "自动",
  MANUAL: "手动"
};

function text(value, fallback = "--") {
  return value === undefined || value === null || value === "" ? fallback : String(value);
}

function label(value) {
  return statusLabels[value] || text(value);
}

function currentAddress() {
  return window.location.href;
}

function setupAddressLinks() {
  const address = currentAddress();
  el.openAddressLink.href = address;
  el.loginOpenAddressLink.href = address;
}

async function copyAddress() {
  const address = currentAddress();
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(address);
    } else {
      const input = document.createElement("input");
      input.value = address;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    addLog(`网页地址已复制：${address}`);
  } catch (error) {
    addLog(`网页地址复制失败：${error.message}`, "err");
  }
}

function setLoggedIn(loggedIn) {
  document.body.classList.toggle("locked", !loggedIn);
  el.loginGate.classList.toggle("hidden", loggedIn);
  if (loggedIn) {
    sessionStorage.setItem("hmiLoggedIn", "1");
    addLog("操作员已登录");
    recordOperation("系统", "登录系统", "完成");
  } else {
    sessionStorage.removeItem("hmiLoggedIn");
  }
}

function handleLogin(event) {
  event.preventDefault();
  const user = el.loginUser.value.trim();
  const password = el.loginPassword.value.trim();
  if (user === loginConfig.user && password === loginConfig.password) {
    el.loginError.textContent = "";
    setLoggedIn(true);
    return;
  }
  el.loginError.textContent = "账号或密码不正确";
}

function logout() {
  setLoggedIn(false);
  el.loginPassword.value = "";
  el.loginUser.focus();
  addLog("操作员已退出登录");
  recordOperation("系统", "退出登录", "完成");
}

function showCloseDialog() {
  el.closeDialog.hidden = false;
}

function hideCloseDialog() {
  el.closeDialog.hidden = true;
}

function tryCloseWindow() {
  window.close();
  setTimeout(() => {
    if (!window.closed) {
      addLog("浏览器未允许自动关闭，请手动关闭当前标签页。", "err");
    }
  }, 150);
}

function nowTime() {
  return new Date().toLocaleTimeString("zh-CN", { hour12: false });
}

function clampPercent(value) {
  const next = Number.parseInt(value, 10);
  if (Number.isNaN(next)) return 0;
  return Math.max(0, Math.min(100, next));
}

function readNumber(input, fallback) {
  const value = Number.parseFloat(input.value);
  return Number.isFinite(value) ? value : fallback;
}

function formatDuration(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function limitRows(rows, max = 80) {
  if (rows.length > max) rows.length = max;
}

function addRecord(list, record, max = 80) {
  list.unshift({ time: nowTime(), ...record });
  limitRows(list, max);
}

function recordOperation(source, action, result = "已发送") {
  addRecord(state.operationRecords, { source, action, result });
  renderOperationRecords();
}

function recordAlarm(status) {
  const fault = status.FAULT || "NONE";
  const alarmKey = `${fault}:${status.ALARM || "0"}:${status.ESTOP || "0"}:${status.LIMC || "0"}:${status.LIMR || "0"}`;
  if ((status.ALARM !== "1" && fault === "NONE") || alarmKey === state.lastAlarmKey) return;

  state.lastAlarmKey = alarmKey;
  addRecord(state.alarmRecords, {
    fault,
    description: label(fault),
    run: status.RUN === "1" ? "运行中" : "停止"
  }, 120);
  renderAlarmRecords();
}

function recordHistory(status) {
  const production = state.production;
  addRecord(state.historyRecords, {
    mode: label(status.MODE),
    proc: label(status.PROC),
    run: status.RUN === "1" ? "运行中" : "停止",
    alarm: status.ALARM === "1" ? label(status.FAULT) : "正常",
    batch: String(production.completedBatches),
    weight: `${(production.completedBatches * production.batchWeightKg).toFixed(2)} kg`,
    raw: status
  }, 160);
  renderHistoryRecords();
}

function addLog(message, type = "rx") {
  const line = document.createElement("div");
  line.className = `log-line ${type}`;
  line.textContent = `[${nowTime()}] ${message}`;
  el.logWindow.appendChild(line);
  el.logWindow.scrollTop = el.logWindow.scrollHeight;
}

function setConnected(connected) {
  state.connected = connected;
  const textValue = state.simulation ? "模拟中" : connected ? "已连接" : "未连接";
  el.portState.classList.toggle("connected", connected || state.simulation);
  el.connectionText.textContent = textValue;
  el.sideConnectionText.textContent = textValue;
  el.connectBtn.disabled = connected || state.simulation;
  el.disconnectBtn.disabled = !connected;
}

function setModeButtons(mode) {
  el.manualBtn.classList.toggle("active", mode !== "AUTO");
  el.autoBtn.classList.toggle("active", mode === "AUTO");
}

function switchView(viewName) {
  document.querySelectorAll(".nav-item").forEach(button => {
    button.classList.toggle("active", button.dataset.view === viewName);
  });
  document.querySelectorAll(".view").forEach(panel => {
    panel.classList.toggle("active", panel.dataset.viewPanel === viewName);
  });
  el.viewTitle.textContent = viewTitles[viewName] || viewTitles.overview;
  if (viewName === "history") renderHistoryRecords();
}

function updateProductionPlanFromInputs() {
  const production = state.production;
  production.plannedMinutes = Math.max(1, readNumber(el.plannedMinutesInput, 30));
  production.targetWeightKg = Math.max(0, readNumber(el.targetWeightInput, 15));
  production.batchWeightKg = Math.max(0, readNumber(el.batchWeightInput, 0.5));
  production.batchPieces = Math.max(0, Math.floor(readNumber(el.batchPiecesInput, 20)));
  renderProduction();
}

function resetProductionStats() {
  state.production.elapsedMs = 0;
  state.production.lastTickAt = null;
  state.production.completedBatches = 0;
  state.production.lastProcess = state.lastStatus.PROC || "IDLE";
  state.production.simulatorTick = 0;
  renderProduction();
  addLog("加工统计已清零");
  recordOperation("界面", "清零加工统计", "完成");
}

function markCompletedBatch() {
  state.production.completedBatches += 1;
}

function updateProductionFromStatus(status) {
  const production = state.production;
  const proc = status.PROC;

  if (proc === "CYCLE_COMPLETE" && production.lastProcess !== "CYCLE_COMPLETE") {
    markCompletedBatch();
  }

  if (proc) production.lastProcess = proc;
  renderProduction();
}

function tickProductionClock() {
  const production = state.production;
  const running = state.lastStatus.RUN === "1";
  const now = Date.now();

  if (running) {
    if (production.lastTickAt !== null) production.elapsedMs += now - production.lastTickAt;
    production.lastTickAt = now;
  } else {
    production.lastTickAt = null;
  }

  if (state.simulation && running && state.simulator.MODE === "AUTO" && state.simulator.ALARM !== "1") {
    production.simulatorTick += 1;
    if (production.simulatorTick >= 3) {
      production.simulatorTick = 0;
      simulatorAdvanceProcess();
      handleIncomingLine(simulatorStatusLine());
    }
  }

  renderProduction();
}

function renderProduction() {
  const production = state.production;
  const plannedMs = production.plannedMinutes * 60 * 1000;
  const completedWeight = production.completedBatches * production.batchWeightKg;
  const completedPieces = production.completedBatches * production.batchPieces;
  const timeProgress = plannedMs > 0 ? production.elapsedMs / plannedMs : 0;
  const weightProgress = production.targetWeightKg > 0 ? completedWeight / production.targetWeightKg : 0;
  const progress = Math.min(1, Math.max(timeProgress, weightProgress));
  const percent = Math.round(progress * 100);

  el.plannedTimeValue.textContent = formatDuration(plannedMs);
  el.elapsedTimeValue.textContent = formatDuration(production.elapsedMs);
  el.remainingTimeValue.textContent = formatDuration(Math.max(0, plannedMs - production.elapsedMs));
  el.completedBatchValue.textContent = String(production.completedBatches);
  el.completedWeightValue.textContent = `${completedWeight.toFixed(2)} kg`;
  el.completedPiecesValue.textContent = `${completedPieces} 个`;
  el.progressPercentValue.textContent = `${percent}%`;
  el.progressFill.style.width = `${percent}%`;
}

function setInputChip(id, active) {
  document.getElementById(id).classList.toggle("active", active);
}

function syncPair(range, input, value) {
  const percent = clampPercent(value);
  range.value = percent;
  input.value = percent;
}

function setGauge(name, value) {
  const percent = clampPercent(value);
  el[`${name}GaugeValue`].textContent = `${percent}%`;
  el[`${name}GaugeFill`].style.width = `${percent}%`;
}

function setProcessNode(proc) {
  document.querySelectorAll(".process-node").forEach(node => {
    node.classList.toggle("active", node.dataset.procNode === proc);
  });
}

function applyStatus(status) {
  state.lastStatus = { ...state.lastStatus, ...status };

  const merged = state.lastStatus;
  const run = status.RUN;
  const alarm = status.ALARM;
  const estop = status.ESTOP;
  const limc = status.LIMC;
  const limr = status.LIMR;
  const fault = status.FAULT;

  el.runValue.textContent = run === "1" ? "运行中" : run === "0" ? "停止" : "--";
  el.modeValue.textContent = label(status.MODE);
  el.processValue.textContent = label(status.PROC);
  el.alarmValue.textContent = alarm === "1" ? "报警" : alarm === "0" ? "正常" : "--";
  el.faultValue.textContent = label(fault);
  el.estopValue.textContent = estop === "1" ? "触发" : estop === "0" ? "正常" : "--";
  el.limitConveyorValue.textContent = limc === "1" ? "触发" : limc === "0" ? "正常" : "--";
  el.limitRollerValue.textContent = limr === "1" ? "触发" : limr === "0" ? "正常" : "--";
  el.selectedValue.textContent = label(status.SEL);
  el.lastUpdate.textContent = nowTime();
  el.ioUpdateTime.textContent = nowTime();

  document.querySelector(".status-cell.warning").classList.toggle("active", alarm === "1");
  document.querySelector(".status-cell.danger").classList.toggle("active", fault && fault !== "NONE");
  setInputChip("estopChip", estop === "1");
  setInputChip("limitConveyorChip", limc === "1");
  setInputChip("limitRollerChip", limr === "1");
  setModeButtons(status.MODE);
  setProcessNode(status.PROC || "IDLE");

  if (status.CV !== undefined) {
    syncPair(el.conveyorRange, el.conveyorInput, status.CV);
    setGauge("conveyor", status.CV);
  }
  if (status.VB !== undefined) {
    syncPair(el.vibratorRange, el.vibratorInput, status.VB);
    setGauge("vibrator", status.VB);
  }
  if (status.RL !== undefined) {
    syncPair(el.rollerRange, el.rollerInput, status.RL);
    setGauge("roller", status.RL);
  }

  updateProductionFromStatus(status);
  recordAlarm(merged);
  recordHistory(merged);
}

function parseStatusLine(line) {
  if (!line.startsWith("STATUS ")) return null;
  const status = {};
  line.slice(7).trim().split(/\s+/).forEach(part => {
    const index = part.indexOf("=");
    if (index > 0) status[part.slice(0, index)] = part.slice(index + 1);
  });
  return status;
}

function handleIncomingLine(rawLine) {
  const line = rawLine.trim();
  if (!line) return;

  addLog(line, line.startsWith("ERR") ? "err" : "rx");
  const status = parseStatusLine(line);
  if (status) {
    applyStatus(status);
  } else if (line.startsWith("FAULT=")) {
    applyStatus({ FAULT: line.slice(6), ALARM: line.endsWith("NONE") ? "0" : "1" });
  } else if (line.startsWith("OK")) {
    recordOperation("设备", line, "确认");
  } else if (line.startsWith("ERR")) {
    recordOperation("设备", line, "异常");
  } else if (line.includes("ESTOP")) {
    applyStatus({ ESTOP: "1", ALARM: "1", FAULT: "ESTOP", RUN: "0" });
  } else if (line.includes("LIMIT")) {
    applyStatus({ ALARM: "1", RUN: "0" });
  }

  if (line === "OK RESET") sendCommand("STATUS");
}

function simulatorStatusLine() {
  const sim = state.simulator;
  return `STATUS MODE=${sim.MODE} RUN=${sim.RUN} PROC=${sim.PROC} ESTOP=${sim.ESTOP} ALARM=${sim.ALARM} FAULT=${sim.FAULT} LIMC=${sim.LIMC} LIMR=${sim.LIMR} CV=${sim.CV} VB=${sim.VB} RL=${sim.RL} SEL=${sim.SEL}`;
}

function simulatorApplyFault(fault) {
  const sim = state.simulator;
  sim.RUN = "0";
  sim.PROC = "IDLE";
  sim.ALARM = "1";
  sim.FAULT = fault;
  if (fault === "ESTOP") sim.ESTOP = "1";
  if (fault === "LIMIT_CONVEYOR") sim.LIMC = "1";
  if (fault === "LIMIT_ROLLER") sim.LIMR = "1";
}

function simulatorAdvanceProcess() {
  const sim = state.simulator;
  if (sim.MODE !== "AUTO" || sim.RUN !== "1" || sim.ALARM === "1") return;

  const flow = ["FEED_TO_DRUM", "DRUM_SEPARATING", "VIBRATORY_SORTING", "CYCLE_COMPLETE"];
  sim.PROC = flow[sim.autoStep % flow.length];
  sim.autoStep += 1;
}

function simulatorHandleCommand(command) {
  const sim = state.simulator;
  const clean = command.trim().toUpperCase();
  let response = "OK";

  if (clean === "STATUS") {
    handleIncomingLine(simulatorStatusLine());
    return;
  }
  if (clean === "FAULT?") {
    handleIncomingLine(`FAULT=${sim.FAULT}`);
    return;
  }
  if (clean === "START" || clean === "RUN=1") {
    if (sim.ALARM === "1" || sim.FAULT !== "NONE" || sim.ESTOP === "1" || sim.LIMC === "1" || sim.LIMR === "1") {
      response = "ERR START BLOCKED";
    } else {
      sim.RUN = "1";
      sim.PROC = sim.MODE === "AUTO" ? "FEED_TO_DRUM" : "IDLE";
      response = "OK START";
    }
  } else if (clean === "STOP" || clean === "RUN=0") {
    sim.RUN = "0";
    sim.PROC = "IDLE";
    response = "OK STOP";
  } else if (clean === "RESET") {
    sim.ESTOP = "0";
    sim.LIMC = "0";
    sim.LIMR = "0";
    sim.ALARM = "0";
    sim.FAULT = "NONE";
    sim.RUN = "0";
    sim.PROC = "IDLE";
    response = "OK RESET";
  } else if (clean === "ESTOP") {
    simulatorApplyFault("ESTOP");
    response = "OK ESTOP";
  } else if (clean === "MODE=A") {
    sim.MODE = "AUTO";
    sim.PROC = "IDLE";
    response = "OK MODE AUTO";
  } else if (clean === "MODE=M") {
    sim.MODE = "MANUAL";
    sim.PROC = "IDLE";
    response = "OK MODE MANUAL";
  } else if (clean === "PRESET1") {
    sim.CV = "55";
    sim.VB = "45";
    sim.RL = "60";
    response = "OK PRESET1";
  } else if (clean === "SAVE") {
    sim.saved = { CV: sim.CV, VB: sim.VB, RL: sim.RL, MODE: sim.MODE };
    response = "OK SAVE";
  } else if (clean === "LOAD") {
    if (sim.saved) Object.assign(sim, sim.saved);
    response = "OK LOAD";
  } else if (/^[CVR]=\d{1,3}$/.test(clean)) {
    const [device, value] = clean.split("=");
    const percent = String(clampPercent(value));
    if (device === "C") sim.CV = percent;
    if (device === "V") sim.VB = percent;
    if (device === "R") sim.RL = percent;
    response = `OK ${device}`;
  } else {
    response = "ERR CMD";
  }

  simulatorAdvanceProcess();
  handleIncomingLine(response);
  handleIncomingLine(simulatorStatusLine());
}

function setSimulation(enabled) {
  state.simulation = enabled;
  el.simulateBtn.classList.toggle("sim-active", enabled);
  el.simulateBtn.textContent = enabled ? "关闭模拟" : "开启模拟";
  setConnected(state.connected);
  addLog(enabled ? "SIM READY: 虚拟 STM32 已启动" : "SIM STOPPED: 虚拟 STM32 已关闭");
  recordOperation("界面", enabled ? "开启模拟" : "关闭模拟", "完成");
  if (enabled) handleIncomingLine(simulatorStatusLine());
}

async function sendCommand(command) {
  const clean = command.trim().toUpperCase();
  if (!clean) return;

  addLog(`> ${clean}`, "tx");
  recordOperation("界面", clean, state.simulation ? "模拟执行" : "待设备确认");

  if (state.simulation) {
    simulatorHandleCommand(clean);
    return;
  }

  if (!state.writer) {
    addLog("串口未连接，命令未发送", "err");
    recordOperation("界面", clean, "串口未连接");
    return;
  }

  const data = new TextEncoder().encode(`${clean}\r\n`);
  await state.writer.write(data);
}

async function readLoop() {
  const decoder = new TextDecoder();
  while (state.port && state.port.readable) {
    state.reader = state.port.readable.getReader();
    try {
      while (true) {
        const { value, done } = await state.reader.read();
        if (done) break;
        state.textBuffer += decoder.decode(value, { stream: true });
        const lines = state.textBuffer.split(/\r?\n/);
        state.textBuffer = lines.pop() || "";
        lines.forEach(handleIncomingLine);
      }
    } catch (error) {
      addLog(`读取失败：${error.message}`, "err");
    } finally {
      state.reader.releaseLock();
      state.reader = null;
    }
  }
}

async function connectSerial() {
  if (!("serial" in navigator)) {
    addLog("当前浏览器不支持 Web Serial", "err");
    return;
  }

  try {
    state.port = await navigator.serial.requestPort();
    await state.port.open({ baudRate: Number(el.baudRate.value) });
    state.writer = state.port.writable.getWriter();
    setConnected(true);
    addLog("串口已连接");
    recordOperation("界面", `连接串口 ${el.baudRate.value}`, "完成");
    readLoop();
    await sendCommand("STATUS");
  } catch (error) {
    addLog(`连接失败：${error.message}`, "err");
    recordOperation("界面", "连接串口", "失败");
  }
}

async function disconnectSerial() {
  try {
    if (state.reader) await state.reader.cancel();
    if (state.writer) {
      state.writer.releaseLock();
      state.writer = null;
    }
    if (state.port) {
      await state.port.close();
      state.port = null;
    }
  } catch (error) {
    addLog(`断开失败：${error.message}`, "err");
  } finally {
    setConnected(false);
    addLog("串口已断开");
    recordOperation("界面", "断开串口", "完成");
  }
}

function bindPercent(range, input) {
  range.addEventListener("input", () => {
    input.value = range.value;
    updateLocalGauges();
  });
  input.addEventListener("input", () => {
    range.value = clampPercent(input.value);
    input.value = range.value;
    updateLocalGauges();
  });
}

function updateLocalGauges() {
  setGauge("conveyor", el.conveyorInput.value);
  setGauge("vibrator", el.vibratorInput.value);
  setGauge("roller", el.rollerInput.value);
}

function getDeviceValue(device) {
  if (device === "C") return el.conveyorInput.value;
  if (device === "V") return el.vibratorInput.value;
  return el.rollerInput.value;
}

function simulateFeedback() {
  setSimulation(!state.simulation);
}

function triggerSimFault(fault) {
  if (!state.simulation) {
    addLog("请先开启模拟环境", "err");
    return;
  }
  simulatorApplyFault(fault);
  handleIncomingLine(simulatorStatusLine());
}

function renderOperationRecords() {
  el.operationRecordBody.innerHTML = state.operationRecords.map(record => `
    <tr>
      <td>${record.time}</td>
      <td>${record.source}</td>
      <td>${record.action}</td>
      <td>${record.result}</td>
    </tr>
  `).join("");
}

function renderAlarmRecords() {
  el.alarmRecordBody.innerHTML = state.alarmRecords.map(record => `
    <tr>
      <td>${record.time}</td>
      <td>${record.fault}</td>
      <td>${record.description}</td>
      <td>${record.run}</td>
    </tr>
  `).join("");
  el.alarmCountValue.textContent = String(state.alarmRecords.length);
  el.currentAlarmSummary.textContent = state.alarmRecords[0]?.description || "正常";
}

function renderHistoryRecords() {
  const filter = el.historyFilter.value;
  const rows = state.historyRecords.filter(record => {
    if (filter === "RUNNING") return record.raw.RUN === "1";
    if (filter === "ALARM") return record.raw.ALARM === "1";
    if (filter === "COMPLETE") return record.raw.PROC === "CYCLE_COMPLETE";
    return true;
  });

  el.historyRecordBody.innerHTML = rows.map(record => `
    <tr>
      <td>${record.time}</td>
      <td>${record.mode}</td>
      <td>${record.proc}</td>
      <td>${record.run}</td>
      <td>${record.alarm}</td>
      <td>${record.batch}</td>
      <td>${record.weight}</td>
    </tr>
  `).join("");
}

document.querySelectorAll(".nav-item").forEach(button => {
  button.addEventListener("click", () => switchView(button.dataset.view));
});

el.loginForm.addEventListener("submit", handleLogin);
el.copyAddressBtn.addEventListener("click", copyAddress);
el.loginCopyAddressBtn.addEventListener("click", copyAddress);
el.logoutBtn.addEventListener("click", logout);
el.closeWindowBtn.addEventListener("click", showCloseDialog);
el.confirmCloseBtn.addEventListener("click", tryCloseWindow);
el.cancelCloseBtn.addEventListener("click", hideCloseDialog);
document.getElementById("connectBtn").addEventListener("click", connectSerial);
document.getElementById("disconnectBtn").addEventListener("click", disconnectSerial);
document.getElementById("startBtn").addEventListener("click", () => sendCommand("START"));
document.getElementById("stopBtn").addEventListener("click", () => sendCommand("STOP"));
document.getElementById("resetBtn").addEventListener("click", () => sendCommand("RESET"));
document.getElementById("estopBtn").addEventListener("click", () => sendCommand("ESTOP"));
document.getElementById("statusBtn").addEventListener("click", () => sendCommand("STATUS"));
document.getElementById("faultBtn").addEventListener("click", () => sendCommand("FAULT?"));
document.getElementById("saveBtn").addEventListener("click", () => sendCommand("SAVE"));
document.getElementById("loadBtn").addEventListener("click", () => sendCommand("LOAD"));
document.getElementById("preset1Btn").addEventListener("click", () => sendCommand("PRESET1"));
document.getElementById("manualBtn").addEventListener("click", () => sendCommand("MODE=M"));
document.getElementById("autoBtn").addEventListener("click", () => sendCommand("MODE=A"));
document.getElementById("simulateBtn").addEventListener("click", simulateFeedback);
document.getElementById("simEStopBtn").addEventListener("click", () => triggerSimFault("ESTOP"));
document.getElementById("simLimitConveyorBtn").addEventListener("click", () => triggerSimFault("LIMIT_CONVEYOR"));
document.getElementById("simLimitRollerBtn").addEventListener("click", () => triggerSimFault("LIMIT_ROLLER"));
document.getElementById("simClearBtn").addEventListener("click", () => sendCommand("RESET"));
document.getElementById("resetProductionBtn").addEventListener("click", resetProductionStats);
document.getElementById("clearLogBtn").addEventListener("click", () => {
  el.logWindow.textContent = "";
});
document.getElementById("clearOperationRecordsBtn").addEventListener("click", () => {
  state.operationRecords = [];
  renderOperationRecords();
});
document.getElementById("clearAlarmRecordsBtn").addEventListener("click", () => {
  state.alarmRecords = [];
  state.lastAlarmKey = "NONE";
  renderAlarmRecords();
});
document.getElementById("refreshHistoryBtn").addEventListener("click", renderHistoryRecords);
el.historyFilter.addEventListener("change", renderHistoryRecords);

document.querySelectorAll(".apply").forEach(button => {
  button.addEventListener("click", () => {
    const device = button.dataset.device;
    sendCommand(`${device}=${clampPercent(getDeviceValue(device))}`);
  });
});

el.manualSendForm.addEventListener("submit", event => {
  event.preventDefault();
  sendCommand(el.manualCommand.value);
  el.manualCommand.value = "";
});

bindPercent(el.conveyorRange, el.conveyorInput);
bindPercent(el.vibratorRange, el.vibratorInput);
bindPercent(el.rollerRange, el.rollerInput);
[el.plannedMinutesInput, el.targetWeightInput, el.batchWeightInput, el.batchPiecesInput].forEach(input => {
  input.addEventListener("input", updateProductionPlanFromInputs);
});

setConnected(false);
setupAddressLinks();
setLoggedIn(sessionStorage.getItem("hmiLoggedIn") === "1");
applyStatus({ MODE: "MANUAL", RUN: "0", PROC: "IDLE", ALARM: "0", FAULT: "NONE", ESTOP: "0", LIMC: "0", LIMR: "0", CV: "55", VB: "45", RL: "60", SEL: "CONVEYOR" });
updateProductionPlanFromInputs();
renderOperationRecords();
renderAlarmRecords();
renderHistoryRecords();
setInterval(tickProductionClock, 1000);
addLog("HMI READY");
recordOperation("系统", "HMI 启动", "就绪");
