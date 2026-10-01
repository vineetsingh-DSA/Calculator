let current = "0", prev = null, operator = null, justEvaluated = false, error = false;
const valueEl = document.getElementById("value");
const exprEl = document.getElementById("expr");

function fmt(s){
  if (error) return s;
  if (s === "-" || s.endsWith(".")) return s;
  const [i, d] = s.split(".");
  const n = Number(i).toLocaleString("en-IN");
  return d !== undefined ? n + "." + d : n;
}
function render(){
  const text = fmt(current);
  valueEl.textContent = text;
  valueEl.classList.toggle("small", text.length > 11);
  exprEl.textContent = operator ? fmt(String(prev)) + " " + operator : "";
}
function reset(){ current = "0"; prev = null; operator = null; justEvaluated = false; error = false; }
function compute(a, b, op){
  a = Number(a); b = Number(b);
  let r;
  if (op === "+") r = a + b;
  else if (op === "−") r = a - b;
  else if (op === "×") r = a * b;
  else if (op === "÷") { if (b === 0) return null; r = a / b; }
  return String(parseFloat(r.toPrecision(12)));
}
function num(v){
  if (error) reset();
  if (justEvaluated) { current = "0"; justEvaluated = false; }
  if (current.replace(/[-.]/g, "").length >= 15) return;
  current = current === "0" ? v : current + v;
}
function dot(){
  if (error) reset();
  if (justEvaluated) { current = "0"; justEvaluated = false; }
  if (!current.includes(".")) current += ".";
}
function op(v){
  if (error) return;
  if (operator && !justEvaluated && prev !== null) {
    const r = compute(prev, current, operator);
    if (r === null) return fail();
    prev = r;
  } else { prev = current; }
  operator = v; current = "0"; justEvaluated = false;
  if (prev !== null && current === "0") { /* wait for next number */ }
}
function eq(){
  if (error || !operator) return;
  const r = compute(prev, current, operator);
  if (r === null) return fail();
  exprEl.textContent = fmt(String(prev)) + " " + operator + " " + fmt(current) + " =";
  current = r; prev = null; operator = null; justEvaluated = true;
  valueEl.textContent = fmt(current);
  valueEl.classList.toggle("small", fmt(current).length > 11);
  return "keep";
}
function fail(){ reset(); error = true; current = "Cannot divide by 0"; }
function percent(){
  if (error) return;
  current = String(parseFloat((Number(current) / 100).toPrecision(12)));
}
function back(){
  if (error) return reset();
  if (justEvaluated) return;
  current = current.length > 1 ? current.slice(0, -1) : "0";
  if (current === "-") current = "0";
}
function handle(a, v){
  let keep;
  if (a === "num") num(v);
  else if (a === "dot") dot();
  else if (a === "op") op(v);
  else if (a === "eq") keep = eq();
  else if (a === "clear") reset();
  else if (a === "back") back();
  else if (a === "percent") percent();
  if (keep) return;
  render();
}
document.getElementById("keys").addEventListener("click", e => {
  const b = e.target.closest("button");
  if (b) handle(b.dataset.a, b.dataset.v);
});
document.addEventListener("keydown", e => {
  const k = e.key;
  if (/^[0-9]$/.test(k)) handle("num", k);
  else if (k === ".") handle("dot");
  else if (k === "+") handle("op", "+");
  else if (k === "-") handle("op", "−");
  else if (k === "*") handle("op", "×");
  else if (k === "/") { e.preventDefault(); handle("op", "÷"); }
  else if (k === "Enter" || k === "=") { e.preventDefault(); handle("eq"); }
  else if (k === "Backspace") handle("back");
  else if (k === "Escape") handle("clear");
  else if (k === "%") handle("percent");
});
render();