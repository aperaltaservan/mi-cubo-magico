import * as S from '../js/stats.js';

let ok = 0, bad = 0;
const t = (n, c, x) => { if (c) ok++; else { bad++; console.log('FALLO: ' + n + (x !== undefined ? '  -> ' + x : '')); } };
const s = (ms, penalty) => ({ ms, penalty: penalty || 0 });

t('formato bajo el minuto', S.formatTime(12345) === '12.34', S.formatTime(12345));
t('formato sobre el minuto', S.formatTime(83210) === '1:23.21', S.formatTime(83210));
t('+2 suma dos segundos', S.effective(s(10000, 2)) === 12000);
t('DNF es infinito', S.effective(s(10000, S.DNF)) === Infinity);
t('texto del +2', S.formatSolve(s(10000, 2)) === '12.00+', S.formatSolve(s(10000, 2)));
t('texto del DNF', S.formatSolve(s(10000, S.DNF)) === 'DNF(10.00)');

// ao5: quita mejor y peor
const cinco = [s(10000), s(20000), s(30000), s(40000), s(50000)];
t('ao5 quita mejor y peor', S.average(cinco, 5) === 30000, S.average(cinco, 5));
t('faltan intentos -> null', S.average(cinco, 12) === null);

// un DNF cuenta como peor y se descarta
const conDnf = [s(10000), s(20000), s(30000), s(40000), s(50000, S.DNF)];
t('un DNF se descarta como peor', S.average(conDnf, 5) === 30000, S.average(conDnf, 5));
// dos DNF -> la media es DNF
const dosDnf = [s(10000), s(20000), s(30000), s(40000, S.DNF), s(50000, S.DNF)];
t('dos DNF -> media DNF', S.average(dosDnf, 5) === Infinity);

t('mo3 promedia todos', S.mean([s(10000), s(20000), s(30000)], 3) === 20000);
t('mo3 con DNF es DNF', S.mean([s(10000), s(20000), s(30000, S.DNF)], 3) === Infinity);

// mejor ao5 de una tirada larga
// los rapidos van en medio: la mejor ao5 no puede ser la ultima
const tirada = [s(30000), s(10000), s(11000), s(12000), s(13000), s(14000), s(35000), s(34000)];
t('la mejor ao5 mira toda la sesión', S.bestAverage(tirada, 5) < S.average(tirada, 5),
  S.bestAverage(tirada, 5) + ' vs ' + S.average(tirada, 5));

t('mejor intento', S.bestSolve(tirada).ms === 10000);
t('peor intento', S.worstSolve(tirada).ms === 35000);
t('solo DNF -> sin mejor', S.bestSolve([s(1000, S.DNF)]) === null);

const r = S.summary(tirada);
t('resumen cuenta los intentos', r.total === 8 && r.validos === 8);
t('resumen sin ao12 si no hay 12', r.ao12 === null);

// penalización de la inspección (WCA)
t('inspección de 10 s: sin penalizar', S.inspectionPenalty(10) === 0);
t('inspección de 15 s justos: sin penalizar', S.inspectionPenalty(15) === 0);
t('inspección de 15,5 s: +2', S.inspectionPenalty(15.5) === 2);
t('inspección de 17 s justos: +2', S.inspectionPenalty(17) === 2);
t('inspección de 17,5 s: DNF', S.inspectionPenalty(17.5) === S.DNF);

console.log(ok + ' pruebas de tiempos OK, ' + bad + ' fallos');
if (bad) process.exitCode = 1;
