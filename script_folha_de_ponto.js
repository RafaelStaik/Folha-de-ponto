(() => {
    const loggedInUserID = sessionStorage.getItem('loggedInUserID');
    const loggedInUserName = sessionStorage.getItem('loggedInUserName');
    const shiftTypeRadio = document.querySelector('input[name="shiftType"]:checked');

    if (!loggedInUserID) {
        window.location.href = "index.html";
        return;
    }

    const themeToggle = document.getElementById('theme-toggle');
    const tabelaDados = document.getElementById('tabelaDados');
    const monthLabel = document.getElementById('monthLabel');
    const employeeNameText = document.getElementById('employeeNameText');
    const floatingToggleBtn = document.getElementById('floatingToggleBtn');
    const floatingButtons = document.getElementById('floatingButtons');
    const baterPontoBtn = document.getElementById('baterPontoBtn');
    const limparDadosBtn = document.getElementById('limparDadosBtn');
    const exportExcelBtn = document.getElementById('exportExcelBtn');
    const exportPdfBtn = document.getElementById('exportPdfBtn');
    const prevMonthBtn = document.getElementById('prevMonthBtn');
    const nextMonthBtn = document.getElementById('nextMonthBtn');
    const editModal = document.getElementById('editModal');
    const editForm = document.getElementById('editForm');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const entradaInput = document.getElementById('entradaInput');
    const saidaInput = document.getElementById('saidaInput');
    const anotacoesInput = document.getElementById('anotacoesInput');
    const settingsModal = document.getElementById('settingsModal');
    const settingsForm = document.getElementById('settingsForm');
    const cancelSettingsBtn = document.getElementById('cancelSettingsBtn');
    const employeeNameSetting = document.getElementById('employeeNameSetting');
    const intervalInicioSetting = document.getElementById('intervalInicioSetting');
    const intervalFimSetting = document.getElementById('intervalFimSetting');
    const workScheduleSetting = document.getElementById('workScheduleSetting');
    const entryTimeSetting = document.getElementById('entryTimeSetting');
    const exitTimeSetting = document.getElementById('exitTimeSetting');
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    const messageBox = document.getElementById('messageBox');
    const messageBoxTitle = document.getElementById('messageBoxTitle');
    const messageBoxText = document.getElementById('messageBoxText');
    const messageBoxButtons = document.getElementById('messageBoxButtons');
    const monthsPt = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const weekDayShort = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
    
    const holidays = {
      '01-01': 'Confraternização Universal', '03-04': 'Carnaval', '04-18': 'Paixão de Cristo',
      '04-21': 'Tiradentes', '05-01': 'Dia do Trabalho', '06-19': 'Corpus Christi',
      '09-07': 'Independência do Brasil', '10-12': 'Nossa Srª Aparecida', '11-02': 'Finados',
      '11-15': 'Proclamação da República', '11-20': 'Dia da Consciência Negra', '12-25': 'Natal'
    };
    
    let currentDate = new Date();
    let allUserPunches = [];
    let punches = [];
    let editingIndex = null;
    let intervalConfig = { intervaloInicio: '-', intervaloFim: '-', dataInicio: null };
    let scheduleConfig = { workSchedule: 'Segunda a Sexta', entryTime: '07:00', exitTime: '16:45' };
    let employeeName = loggedInUserName;

    function setTheme(theme) {
        document.body.dataset.theme = theme;
        localStorage.setItem('theme_' + loggedInUserID, theme);
        if(themeToggle) {
          themeToggle.checked = theme === 'dark';
        }
    }

    if(themeToggle) {
      themeToggle.addEventListener('change', () => {
          setTheme(themeToggle.checked ? 'dark' : 'light');
      });
    }

    function saveStorage() {
        localStorage.setItem('folhaPontoData_' + loggedInUserID, JSON.stringify(allUserPunches));
        localStorage.setItem('employeeName_' + loggedInUserID, employeeName);
        localStorage.setItem('intervalConfigData_' + loggedInUserID, JSON.stringify(intervalConfig));
        localStorage.setItem('scheduleConfigData_' + loggedInUserID, JSON.stringify(scheduleConfig));
    }

    function loadStorage() {
        const storedPunches = localStorage.getItem('folhaPontoData_' + loggedInUserID);
        const storedEmployeeName = localStorage.getItem('employeeName_' + loggedInUserID);
        const storedIntervalConfig = localStorage.getItem('intervalConfigData_' + loggedInUserID);
        const storedScheduleConfig = localStorage.getItem('scheduleConfigData_' + loggedInUserID);
        allUserPunches = storedPunches ? JSON.parse(storedPunches) : [];
        if (storedEmployeeName) {
            employeeName = storedEmployeeName;
        } else {
            employeeName = loggedInUserName;
            localStorage.setItem('employeeName_' + loggedInUserID, employeeName);
        }
        updateEmployeeNameDisplay();
        try {
            intervalConfig = storedIntervalConfig ? JSON.parse(storedIntervalConfig) : { intervaloInicio: '-', intervaloFim: '-', dataInicio: null };
            scheduleConfig = storedScheduleConfig ? JSON.parse(storedScheduleConfig) : { workSchedule: 'Segunda a Sexta', entryTime: '07:00', exitTime: '16:45' };
        } catch (e) {
            intervalConfig = { intervaloInicio: '-', intervaloFim: '-', dataInicio: null };
            scheduleConfig = { workSchedule: 'Segunda a Sexta', entryTime: '07:00', exitTime: '16:45' };
        }
        const savedTheme = localStorage.getItem('theme_' + loggedInUserID) || 'light';
        setTheme(savedTheme);
        filterAndDisplayMonth();
    }
    
    function filterAndDisplayMonth() {
        punches = allUserPunches.filter(p => {
          const punchDate = parseDate(p.dia);
          return punchDate.getMonth() === currentDate.getMonth() && punchDate.getFullYear() === currentDate.getFullYear();
        });

        if (punches.length === 0) {
            initPunchesForMonth();
        }
        
        applyIntervalConfigToPunches();
        updateMonthLabel();
        rebuildTable();
    }
    
    function initPunchesForMonth() {
        const daysInMonth = getDaysInCurrentMonth(currentDate);
        const newPunchesForMonth = daysInMonth.map(dayStr => {
            const dayDate = parseDate(dayStr);
            const dayOfWeek = dayDate.getDay();
            const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
            let intervaloInicio = '-';
            let intervaloFim = '-';
            if (!isWeekend) {
                intervaloInicio = intervalConfig.intervaloInicio !== '-' ? intervalConfig.intervaloInicio : '-';
                intervaloFim = intervalConfig.intervaloFim !== '-' ? intervalConfig.intervaloFim : '-';
            }
            return {
                dia: dayStr,
                entrada: '-',
                intervaloInicio: intervaloInicio,
                intervaloFim: intervaloFim,
                saida: '-',
                anotacoes: { auto: [], user: '' },
            };
        });
        
        const otherMonthsPunches = allUserPunches.filter(p => {
            const pDate = parseDate(p.dia);
            return pDate.getMonth() !== currentDate.getMonth() || pDate.getFullYear() !== currentDate.getFullYear();
        });
        allUserPunches = [...otherMonthsPunches, ...newPunchesForMonth];
        punches = newPunchesForMonth;
        
        saveStorage();
    }

    function applyIntervalConfigToPunches() {
        if (intervalConfig.intervaloInicio !== '-' && intervalConfig.intervaloFim !== '-') {
            punches.forEach((punch) => {
                const dayDate = parseDate(punch.dia);
                const dayOfWeek = dayDate.getDay();
                const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
                if (!isWeekend && (punch.intervaloInicio === '-' || punch.intervaloInicio === '')) {
                    punch.intervaloInicio = intervalConfig.intervaloInicio;
                }
                if (!isWeekend && (punch.intervaloFim === '-' || punch.intervaloFim === '')) {
                    punch.intervaloFim = intervalConfig.intervaloFim;
                }
            });
        }
        saveStorage();
    }

    function rebuildTable() {
        tabelaDados.innerHTML = '';
        if (punches.length === 0) {
            tabelaDados.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 20px; font-style: italic;">Nenhum registro para este mês.</td></tr>`;
            return;
        }

        const todayFormatted = formatDate(new Date());
        punches.forEach((punch, index) => {
            const dayDate = parseDate(punch.dia);
            const weekDayAbbr = dayDate ? weekDayShort[dayDate.getDay()] : '';
            const dayOfWeek = dayDate.getDay();
            const dateKey = `${String(dayDate.getMonth() + 1).padStart(2, '0')}-${String(dayDate.getDate()).padStart(2, '0')}`;
            const holidayName = holidays[dateKey];
            
            let autoNotes = [...(punch.anotacoes.auto || [])];
            if (holidayName && !autoNotes.includes(holidayName)) {
                autoNotes.unshift(holidayName);
            }

            let displayAnotacoes = autoNotes.map(note => `<span>${note}</span>`).join('<br>');
            if (punch.anotacoes.user) {
                displayAnotacoes += (displayAnotacoes ? '<br>' : '') + `<i>"${punch.anotacoes.user}"</i>`;
            }
            
            const tr = document.createElement('tr');
            tr.dataset.index = index;

            if (punch.dia === todayFormatted) tr.classList.add('current-day');
            if (holidayName) tr.classList.add('holiday-day');
            
            tr.innerHTML = `
                <td style="text-align:left; white-space: nowrap;">${punch.dia} (${weekDayAbbr})</td>
                <td class="entrada">${punch.entrada}</td>
                <td class="intervaloInicio">${punch.intervaloInicio || '-'}</td>
                <td class="intervaloFim">${punch.intervaloFim || '-'}</td>
                <td class="saida">${punch.saida}</td>
                <td class="note-cell">${displayAnotacoes}</td>
                <td><button type="button" class="editBtn">Editar</button></td>
            `;
            tabelaDados.appendChild(tr);
        });
        
        tabelaDados.querySelectorAll('.editBtn').forEach(btn => btn.addEventListener('click', onEditClick));
    }

    const formatTime = (date) => date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const formatDate = (date) => date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    function parseDate(dmyStr) {
        if (!dmyStr) return new Date('invalid');
        const parts = dmyStr.split('/');
        return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
    }
    function getDaysInCurrentMonth(date) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const numDays = new Date(year, month + 1, 0).getDate();
        const days = [];
        for (let i = 1; i <= numDays; i++) {
            days.push(formatDate(new Date(year, month, i)));
        }
        return days;
    }
    function updateMonthLabel() {
        monthLabel.textContent = `${monthsPt[currentDate.getMonth()]} de ${currentDate.getFullYear()}`;
    }
    function updateEmployeeNameDisplay() {
        employeeNameText.textContent = employeeName;
    }

function baterPonto() {
    const now = new Date();
    const nowTime = formatTime(now);
    let todayFormatted = formatDate(now);
    
    // Check for night shift (Turno 2 or 3)
    const isNightShift = scheduleConfig.shiftType === '2' || scheduleConfig.shiftType === '3';
    let punchDateToSearch = todayFormatted;

    // If it's a night shift and the current time is after midnight (but before the scheduled exit time),
    // we need to find the punch from the previous day.
    if (isNightShift) {
        const exitTimeParts = scheduleConfig.exitTime.split(':').map(Number);
        const exitHour = exitTimeParts[0];
        const exitMinute = exitTimeParts[1];
        
        const nowHour = now.getHours();
        const nowMinute = now.getMinutes();

        // Condition to check if current time is after midnight but before the scheduled exit time
        if ((nowHour < exitHour || (nowHour === exitHour && nowMinute < exitMinute)) && nowHour < 12) {
             const yesterday = new Date(now);
             yesterday.setDate(now.getDate() - 1);
             punchDateToSearch = formatDate(yesterday);
        }
    }

    const todayIndex = punches.findIndex((p) => p.dia === todayFormatted);
    const punchIndex = punches.findIndex((p) => p.dia === punchDateToSearch);

    if (punchIndex === -1) {
        showMessageBox('Erro', 'Não foi possível encontrar o dia de hoje na tabela.', 'danger');
        return;
    }
    
    let todayPunch = punches[punchIndex];

    if (todayPunch.entrada === '-' || todayPunch.entrada === '') {
        todayPunch.entrada = nowTime;
        showMessageBox('Sucesso', 'Entrada registrada!', 'success');
    } else if (todayPunch.saida === '-' || todayPunch.saida === '') {
        todayPunch.saida = nowTime;
        showMessageBox('Sucesso', 'Saída registrada!', 'success');
    } else {
        showMessageBox('Aviso', 'Entrada e Saída já registradas.', 'info');
    }
    
    saveStorage();
    rebuildTable();
}

    function limparDados() {
        showMessageBox('Atenção', 'Limpar todos os dados deste usuário? Esta ação é irreversível.', 'warning', true, () => {
            localStorage.removeItem('folhaPontoData_' + loggedInUserID);
            localStorage.removeItem('employeeName_' + loggedInUserID);
            localStorage.removeItem('intervalConfigData_' + loggedInUserID);
            localStorage.removeItem('scheduleConfigData_' + loggedInUserID);
            
            allUserPunches = [];
            employeeName = loggedInUserName;
            localStorage.setItem('employeeName_' + loggedInUserID, employeeName);
            
            currentDate = new Date();
            filterAndDisplayMonth();
            showMessageBox('Concluído', 'Dados do usuário limpos!', 'success');
        });
    }

function exportToPdf() {
    const { jsPDF } = window.jspdf;
    const fileName = `Folha de Ponto - ${employeeName.replace(/\s+/g, ' ')} - ${monthsPt[currentDate.getMonth()]}.pdf`;
    
    showMessageBox('Aguarde', 'Gerando seu arquivo PDF...', 'info');

    try {
        let punchesForPdf = [...punches];

        if (scheduleConfig.shiftType === '2' || scheduleConfig.shiftType === '3') {
            const firstDayOfNextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
            const nextDayFormatted = formatDate(firstDayOfNextMonth);

            const nextDayPunch = allUserPunches.find(p => p.dia === nextDayFormatted);
            
            if (nextDayPunch && nextDayPunch.entrada && nextDayPunch.entrada !== '-') {
                punchesForPdf.push(nextDayPunch);
            }
        }
        
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 15;
        let position = 10; 

        pdf.addImage(LOGO_TARGET_BASE64, 'PNG', margin, position, 35, 15); 
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(20);
        pdf.setTextColor("#34495e");
        pdf.text('Folha de Ponto Mensal', pdfWidth / 2, position + 7, { align: 'center' }); 
        position += 20; 
        
        const scheduleBoxY = position; 
        const scheduleBoxWidth = pdfWidth - (margin * 2);
        const scheduleBoxHeight = 18; 
        pdf.setFillColor(249, 249, 249); 
        pdf.setDrawColor(0); 
        pdf.setLineWidth(0.5); 
        pdf.rect(margin, scheduleBoxY, scheduleBoxWidth, scheduleBoxHeight, 'FD');
        
        let currentTextY = scheduleBoxY + 5; 

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9);
        pdf.setTextColor("#000000");
        const nameLabel = "Nome: ";
        pdf.text(nameLabel, margin + 7.4, currentTextY);
        pdf.setFont("helvetica", "normal");
        pdf.text(`${employeeName.toUpperCase()}`, margin + 7.4 + pdf.getTextWidth(nameLabel), currentTextY);

        const monthLabel = "Mês: ";
        const monthValue = `${monthsPt[currentDate.getMonth()].toUpperCase()}`;
        const totalMonthTextWidth = pdf.getTextWidth(monthLabel) + pdf.getTextWidth(monthValue);

        pdf.setFont("helvetica", "bold");
        pdf.text(monthLabel, pdfWidth - margin - 13 - totalMonthTextWidth + pdf.getTextWidth(monthLabel), currentTextY, { align: 'right' });
        pdf.setFont("helvetica", "normal");
        pdf.text(monthValue, pdfWidth - margin - 13, currentTextY, { align: 'right' });

        currentTextY += 7;

        const startX = margin + 5;
        const endX = pdfWidth - margin - 5;
        const availableWidth = endX - startX;
        const numColumns = 5;
        const columnWidth = availableWidth / numColumns;

        const x1 = startX + columnWidth / 2;
        const x2 = startX + columnWidth * 1.5;
        const x3 = startX + columnWidth * 2.5;
        const x4 = startX + columnWidth * 3.5;
        const x5 = startX + columnWidth * 4.5;
        
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9); 
        pdf.text(`Horário de trabalho`, x1, currentTextY, { align: 'center' });
        pdf.text(`Entrada`, x2, currentTextY, { align: 'center' }); 
        pdf.text(`Início intervalo`, x3, currentTextY, { align: 'center' }); 
        pdf.text(`Fim intervalo`, x4, currentTextY, { align: 'center' }); 
        pdf.text(`Saída`, x5, currentTextY, { align: 'center' }); 

        currentTextY += 4;
        
        pdf.setFont("helvetica", "normal");
        pdf.text(`${scheduleConfig.workSchedule}`, x1, currentTextY, { align: 'center' });
        pdf.text(`${scheduleConfig.entryTime}`, x2, currentTextY, { align: 'center' });
        pdf.text(`${intervalConfig.intervaloInicio}`, x3, currentTextY, { align: 'center' });
        pdf.text(`${intervalConfig.intervaloFim}`, x4, currentTextY, { align: 'center' });
        pdf.text(`${scheduleConfig.exitTime}`, x5, currentTextY, { align: 'center' });

        position = scheduleBoxY + scheduleBoxHeight + 5;

        const head = [['DIA', 'ENTRADA', 'INTERVALO\n(INÍCIO)', 'INTERVALO\n(FIM)', 'SAÍDA', 'ANOTAÇÕES']];
        
        const body = punchesForPdf.map(p => {
            const dayDate = parseDate(p.dia);
            const weekDayAbbr = dayDate ? weekDayShort[dayDate.getDay()] : '';
            const displayDay = `${p.dia} (${weekDayAbbr})`;

            const allNotes = [...(p.anotacoes.auto || []), p.anotacoes.user].filter(Boolean);
            const annotations = allNotes.join(' / ');
            
            return [ displayDay, p.entrada, p.intervaloInicio, p.intervaloFim, p.saida, annotations ];
        });

        pdf.autoTable({
            head: head,
            body: body,
            startY: position,
            margin: { left: margin, right: margin },
            theme: 'striped',
            headStyles: {
                fillColor: [52, 152, 219], 
                textColor: 255, 
                fontStyle: 'bold',
                halign: 'center',
                fontSize: 9, 
                cellPadding: 1.5, 
            },
            styles: {
                cellPadding: 1.5, 
                fontSize: 8,    
                valign: 'middle',
                overflow: 'linebreak'
            },
            columnStyles: {
                0: { halign: 'center', cellWidth: 28 },    
                1: { halign: 'center', cellWidth: 20 },  
                2: { halign: 'center', cellWidth: 25 },  
                3: { halign: 'center', cellWidth: 25 },  
                4: { halign: 'center', cellWidth: 20 },  
                5: { halign: 'center', cellWidth: 'auto' } 
            },
            didParseCell: (data) => {
                if (data.section === 'body') {
                    const punch = punchesForPdf[data.row.index];
                    if (!punch) return;
                    const dayDate = parseDate(punch.dia);
                    if (!dayDate) return;

                    const dateKey = `${String(dayDate.getMonth() + 1).padStart(2, '0')}-${String(dayDate.getDate()).padStart(2, '0')}`;
                    
                    if (holidays[dateKey]) {
                        data.cell.styles.fillColor = '#fff5f5';
                        data.cell.styles.textColor = '#e03131';
                        data.cell.styles.fontStyle = 'bold';
                    } 
                }
            }
        });

        let finalY = pdf.lastAutoTable.finalY || position; 
        let signatureYPosition = finalY + 20; 

        if (signatureYPosition > pageHeight - 15) {
            signatureYPosition = pageHeight - 15;
        }

        const signatureLineXStart = pdfWidth / 2 - 40;
        const signatureLineXEnd = pdfWidth / 2 + 40;
        pdf.setLineWidth(0.3);
        pdf.setDrawColor(0);
        pdf.line(signatureLineXStart, signatureYPosition, signatureLineXEnd, signatureYPosition);
        pdf.setFontSize(10);
        pdf.setTextColor(100);
        pdf.text(employeeName, pdfWidth / 2, signatureYPosition + 5, { align: 'center' });

        pdf.save(fileName);

    } catch (err) {
        console.error("Erro ao gerar PDF: ", err);
        showMessageBox('Erro', 'Houve um problema ao gerar o arquivo PDF. Tente novamente.', 'danger');
    } finally {
        closeModal(messageBox);
    }
}

    function openModal(modal) {
        modal.style.display = 'flex';
    }

    function closeModal(modal) {
        modal.style.display = 'none';
    }

    function onEditClick(e) {
        const tr = e.target.closest('tr');
        editingIndex = parseInt(tr.dataset.index, 10);
        const punch = punches[editingIndex];
        entradaInput.value = punch.entrada === '-' ? '' : punch.entrada;
        saidaInput.value = punch.saida === '-' ? '' : punch.saida;
        anotacoesInput.value = punch.anotacoes.user || '';
        openModal(editModal);
    }
    editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        let punch = punches[editingIndex];
        const oldEntrada = punch.entrada;
        const oldSaida = punch.saida;
        punch.entrada = entradaInput.value || '-';
        punch.saida = saidaInput.value || '-';
        punch.anotacoes.user = anotacoesInput.value.trim();
        if (punch.entrada !== oldEntrada || punch.saida !== oldSaida) {
            punch.anotacoes.auto = ['Ajustado manualmente'];
        }
        saveStorage();
        rebuildTable();
        closeModal(editModal);
    });
    settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        employeeName = employeeNameSetting.value.trim();
        intervalConfig.intervaloInicio = intervalInicioSetting.value || '-';
        intervalConfig.intervaloFim = intervalFimSetting.value || '-';
        intervalConfig.dataInicio = new Date().toISOString().slice(0, 10);

    const selectedShiftType = document.querySelector('input[name="shiftType"]:checked').value;
    scheduleConfig.shiftType = selectedShiftType;

    switch (selectedShiftType) {
        case '1':
            scheduleConfig.entryTime = '07:00';
            scheduleConfig.exitTime = '16:45';
            break;
        case '2':
            scheduleConfig.entryTime = '16:40';
            scheduleConfig.exitTime = '01:50';
            break;
        case '3':
            scheduleConfig.entryTime = '23:00';
            scheduleConfig.exitTime = '07:00';
            break;
        default:
            scheduleConfig.entryTime = entryTimeSetting.value || '07:00';
            scheduleConfig.exitTime = exitTimeSetting.value || '16:45';
    }
    
    scheduleConfig.workSchedule = workScheduleSetting.value.trim() || 'Segunda a Sexta';
    
    applyIntervalConfigToPunches();
    saveStorage();
    updateEmployeeNameDisplay();
    rebuildTable();
    closeModal(settingsModal);
});
    cancelEditBtn.addEventListener('click', () => closeModal(editModal));
    cancelSettingsBtn.addEventListener('click', () => closeModal(settingsModal));
    baterPontoBtn.addEventListener('click', baterPonto);
    limparDadosBtn.addEventListener('click', limparDados);
    exportExcelBtn.addEventListener('click', () => {
        const wb = XLSX.utils.book_new();
        const dataToExport = punches.map(p => ({
            Dia: p.dia,
            Entrada: p.entrada,
            'Início Intervalo': p.intervaloInicio,
            'Fim Intervalo': p.intervaloFim,
            Saída: p.saida,
            Anotações: [...(p.anotacoes.auto || []), p.anotacoes.user].filter(Boolean).join(' | ')
        }));
        const ws = XLSX.utils.json_to_sheet(dataToExport);
        XLSX.utils.book_append_sheet(wb, ws, `Folha de Ponto - ${monthsPt[currentDate.getMonth()]}`);
        XLSX.writeFile(wb, `FolhaPonto_${employeeName.replace(/\s/g, '_')}.xlsx`);
    });
    exportPdfBtn.addEventListener('click', exportToPdf);
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        filterAndDisplayMonth();
    });
    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        filterAndDisplayMonth();
    });
    floatingToggleBtn.addEventListener('click', () => {
        const isExpanded = floatingToggleBtn.getAttribute('aria-expanded') === 'true';
        floatingToggleBtn.setAttribute('aria-expanded', !isExpanded);
        floatingButtons.style.display = isExpanded ? 'none' : 'flex';
        floatingToggleBtn.innerHTML = isExpanded ? '☰' : '✖';
    });
    deleteAccountBtn.addEventListener('click', () => {
        showMessageBox('Atenção', 'Você tem certeza que deseja deletar sua conta? Todos os seus dados de ponto serão apagados PERMANENTEMENTE.', 'warning', true, () => {
            showMessageBox('Confirmação Final', 'Esta ação não pode ser desfeita. Deletar a conta mesmo assim?', 'danger', true, () => {
                const users = JSON.parse(localStorage.getItem('timesheet_users')) || [];
                const updatedUsers = users.filter(user => user.id !== loggedInUserID);
                localStorage.setItem('timesheet_users', JSON.stringify(updatedUsers));
                localStorage.removeItem('folhaPontoData_' + loggedInUserID);
                localStorage.removeItem('employeeName_' + loggedInUserID);
                localStorage.removeItem('intervalConfigData_' + loggedInUserID);
                localStorage.removeItem('scheduleConfigData_' + loggedInUserID);
                sessionStorage.clear();
                window.location.href = "index.html";
            });
        });
    });

    function showMessageBox(title, message, type, confirm = false, callback = null) {
        messageBoxTitle.textContent = title;
        messageBoxText.textContent = message;
        messageBoxButtons.innerHTML = '';
        let color = 'var(--primary-color)';
        if (type === 'danger') color = '#e74c3c';
        if (type === 'warning') color = '#f39c12';
        if (type === 'success') color = '#2ecc71';
        if (type === 'info') color = '#3498db';
        messageBoxTitle.style.color = color;
        if (confirm) {
            const confirmBtn = document.createElement('button');
            confirmBtn.textContent = 'Sim';
            confirmBtn.className = 'save-btn';
            confirmBtn.onclick = () => {
                closeModal(messageBox);
                if (callback) callback();
            };
            const cancelBtn = document.createElement('button');
            cancelBtn.textContent = 'Não';
            cancelBtn.className = 'cancel-btn';
            cancelBtn.onclick = () => closeModal(messageBox);
            messageBoxButtons.appendChild(cancelBtn);
            messageBoxButtons.appendChild(confirmBtn);
        } else {
            const okBtn = document.createElement('button');
            okBtn.textContent = 'OK';
            okBtn.className = 'save-btn';
            okBtn.onclick = () => {
                closeModal(messageBox);
                if (callback) callback();
            };
            messageBoxButtons.appendChild(okBtn);
        }
        openModal(messageBox);
    }
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');
    const settingsLink = document.getElementById('settingsLink');
    const logoutLink = document.getElementById('logoutLink');
    userMenuBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        userDropdown.classList.toggle('show');
    });
    settingsLink.addEventListener('click', (e) => {
        e.preventDefault();
        employeeNameSetting.value = employeeName;
        intervalInicioSetting.value = intervalConfig.intervaloInicio === '-' ? '' : intervalConfig.intervaloInicio;
        intervalFimSetting.value = intervalConfig.intervaloFim === '-' ? '' : intervalConfig.intervaloFim;
        workScheduleSetting.value = scheduleConfig.workSchedule || '2ª a 6ª';
        const currentShift = scheduleConfig.shiftType || '1';
document.getElementById(`shift-${currentShift === '1' ? 'diurno' : currentShift === '2' ? 'noturno' : 'misto'}`).checked = true;
        entryTimeSetting.value = scheduleConfig.entryTime || '';
        exitTimeSetting.value = scheduleConfig.exitTime || '';
        openModal(settingsModal);
        userDropdown.classList.remove('show');
    });	
    logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        sessionStorage.clear();
        window.location.href = "index.html";
    });
    window.addEventListener('click', (event) => {
        if (userDropdown.classList.contains('show') && !userMenuBtn.contains(event.target)) {
            userDropdown.classList.remove('show');
        }
    });
    loadStorage();
})();