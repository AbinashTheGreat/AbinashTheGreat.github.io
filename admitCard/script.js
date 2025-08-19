document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const generateBtn = document.getElementById('generateBtn');
    const printBtn = document.getElementById('printBtn');
    const pdfBtn = document.getElementById('pdfBtn');
    const resetBtn = document.getElementById('resetBtn');
    const previewArea = document.getElementById('previewArea');
    const includePhotosCheck = document.getElementById('includePhotos');
    const photoUploadContainer = document.getElementById('photoUploadContainer');
    const addSubjectBtn = document.getElementById('addSubjectBtn');
    const scheduleInputs = document.getElementById('scheduleInputs');
    const columnMappingModal = document.getElementById('columnMappingModal');
    const confirmMapping = document.getElementById('confirmMapping');
    const prevPage = document.getElementById('prevPage');
    const nextPage = document.getElementById('nextPage');
    const printConfirmModal = document.getElementById('printConfirmModal');
    const confirmPrint = document.getElementById('confirmPrint');
    const cancelPrint = document.getElementById('cancelPrint');
    
    // Templates
    const frontTemplate = document.getElementById('frontTemplate');
    const backTemplate = document.getElementById('backTemplate');
    
    // Data storage
    let schoolLogo = null;
    let principalSignature = null;
    let coordinatorSignature = null;
    let teacherSignature = null;
    let studentData = [];
    let studentPhotos = {};
    let examSchedule = [];
    let columnMap = {};
    let currentPage = 0;
    const cardsPerPage = 10;

    // Initialize
    includePhotosCheck.addEventListener('change', function() {
        photoUploadContainer.style.display = this.checked ? 'block' : 'none';
    });

    document.getElementById('teacherSig').addEventListener('change', handleSignatureUpload.bind(null, 'teacher'));

    addSubjectBtn.addEventListener('click', addSubjectInput);

    // Event Listeners
    document.getElementById('schoolLogo').addEventListener('change', handleLogoUpload);
    document.getElementById('studentData').addEventListener('change', handleStudentDataUpload);
    document.getElementById('principalSig').addEventListener('change', handleSignatureUpload.bind(null, 'principal'));
    document.getElementById('coordinatorSig').addEventListener('change', handleSignatureUpload.bind(null, 'coordinator'));
    document.getElementById('studentPhotos').addEventListener('change', handlePhotoUpload);
    generateBtn.addEventListener('click', generateAdmitCards);
    printBtn.addEventListener('click', showPrintConfirm);
    pdfBtn.addEventListener('click', generatePDF);
    resetBtn.addEventListener('click', resetForm);
    prevPage.addEventListener('click', () => changePage(-1));
    nextPage.addEventListener('click', () => changePage(1));
    confirmPrint.addEventListener('click', () => { printConfirmModal.style.display = 'none'; printAdmitCards(); });
    cancelPrint.addEventListener('click', () => { printConfirmModal.style.display = 'none'; });

    // Helper Functions
    function isImage(file) {
        return /\.(jpg|jpeg|png|gif)$/i.test(file.name);
    }

    function formatDate(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }

    function getDayLabel(index) {
        const suffixes = ['th', 'st', 'nd', 'rd'];
        const mod = (index + 1) % 10;
        const suffix = (index + 1) % 100 >= 11 && (index + 1) % 100 <= 13 ? 'th' : suffixes[mod] || 'th';
        return `${index + 1}${suffix} Day`;
    }

    function getWeekday(dateStr, startDayIndex) {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const date = new Date(dateStr);
        const startDate = new Date(document.getElementById('examStartDate').value);
        const dayDiff = Math.floor((date - startDate) / (1000 * 60 * 60 * 24));
        const weekdayIndex = (startDayIndex + dayDiff) % 7;
        return days[weekdayIndex];
    }

    function addSubjectInput() {
        if (examSchedule.length >= 10) {
            alert('Maximum 10 subjects allowed');
            return;
        }
        const row = document.createElement('div');
        row.className = 'schedule-input-row';
        row.innerHTML = `
            <input type="text" class="subject-input" placeholder="Subject" aria-label="Subject Name">
            <input type="date" class="subject-date" aria-label="Subject Exam Date">
            <button type="button" class="remove-subject" role="button" tabindex="0">Remove</button>
        `;
        scheduleInputs.appendChild(row);
        row.querySelector('.remove-subject').addEventListener('click', () => {
            row.remove();
        });
        row.querySelector('.remove-subject').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') row.remove();
        });
    }

    function populateColumnMapping(headers) {
        const selects = ['mapRoll', 'mapName', 'mapClass', 'mapSection', 'mapGuardian', 'mapGuardianContact', 'mapSchedule'];
        selects.forEach(id => {
            const select = document.getElementById(id);
            select.innerHTML = '<option value="">Select Column</option>';
            headers.forEach(header => {
                const option = document.createElement('option');
                option.value = header.toLowerCase();
                option.textContent = header;
                select.appendChild(option);
            });
        });
        columnMappingModal.style.display = 'block';
    }

    // File Handlers
    function handleLogoUpload(e) {
        const file = e.target.files[0];
        if (!file || !isImage(file)) {
            alert('Please upload a valid image file (jpg, jpeg, png, gif)');
            return;
        }
        const reader = new FileReader();
        reader.onload = function(event) {
            schoolLogo = event.target.result;
        };
        reader.readAsDataURL(file);
    }

    function handleSignatureUpload(type, e) {
        const file = e.target.files[0];
        if (!file || !isImage(file)) {
            alert('Please upload a valid image file (jpg, jpeg, png, gif)');
            return;
        }
        const reader = new FileReader();
        reader.onload = function(event) {
            if (type === 'principal') {
                principalSignature = event.target.result;
            } else if (type === 'coordinator') {
                coordinatorSignature = event.target.result;
            } else {
                teacherSignature = event.target.result;
            }
        };
        reader.readAsDataURL(file);
    }

    function handleStudentDataUpload(e) {
        const file = e.target.files[0];
        if (!file || (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls'))) {
            alert('Please upload an Excel file (.xlsx or .xls)');
            return;
        }
        const reader = new FileReader();
        reader.onload = function(event) {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const rawData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
            const headers = rawData[0];
            studentData = rawData.slice(1).map(row => {
                const normalizedRow = {};
                headers.forEach((header, i) => {
                    normalizedRow[header.toLowerCase()] = row[i];
                });
                return normalizedRow;
            });
            populateColumnMapping(headers);
        };
        reader.readAsArrayBuffer(file);
    }

    function handlePhotoUpload(e) {
        const file = e.target.files[0];
        if (!file || !file.name.endsWith('.zip')) {
            alert('Please upload a ZIP file');
            return;
        }
        JSZip.loadAsync(file).then(zip => {
            const promises = [];
            zip.forEach((relPath, zipEntry) => {
                if (!zipEntry.dir && isImage({name: relPath})) {
                    const promise = zipEntry.async('base64').then(content => {
                        const ext = relPath.split('.').pop().toLowerCase();
                        const roll = relPath.split('.')[0];
                        studentPhotos[roll] = `data:image/${ext};base64,${content}`;
                    });
                    promises.push(promise);
                }
            });
            return Promise.all(promises);
        }).then(() => {
            alert('Photos processed successfully');
        }).catch(err => {
            console.error(err);
            alert('Error processing ZIP file: ' + err.message);
        });
    }

    confirmMapping.addEventListener('click', () => {
        columnMap = {
            roll: document.getElementById('mapRoll').value,
            name: document.getElementById('mapName').value,
            class: document.getElementById('mapClass').value,
            section: document.getElementById('mapSection').value,
            guardian: document.getElementById('mapGuardian').value,
            guardianContact: document.getElementById('includeGuardianContact').checked ? document.getElementById('mapGuardianContact').value : null,
            schedule: document.getElementById('mapSchedule').value
        };
        if (!columnMap.roll || !columnMap.name) {
            alert('Please map Roll Number and Student Name');
            return;
        }
        columnMappingModal.style.display = 'none';
    });

    // Card Generation
    function generateAdmitCards() {
        if (studentData.length === 0 || Object.keys(columnMap).length === 0) {
            alert('Please upload and map student data first');
            return;
        }
        
        const schoolName = document.getElementById('schoolName').value.trim();
        const includeMotto = document.getElementById('includeMotto').checked;
        const schoolMotto = includeMotto ? document.getElementById('schoolMotto').value.trim() : '';
        const schoolAddress = document.getElementById('schoolAddress').value.trim();
        const schoolContact = document.getElementById('schoolContact').value.trim();
        const className = document.getElementById('classInput').value.trim();
        const startDateInput = document.getElementById('examStartDate');
        const endDateInput = document.getElementById('examEndDate');
        let examStart = startDateInput.value;
        let examEnd = endDateInput.value;
        const startDayIndex = parseInt(document.getElementById('startDay').value);
        const teacherPhone = document.getElementById('teacherPhone').value.trim();
        const includeTeacherSig = document.getElementById('includeTeacherSig').checked;
        const includePhotos = includePhotosCheck.checked;
        const includeGuardianContact = document.getElementById('includeGuardianContact').checked;

        // Fallback to valueAsDate if value is empty
        if (!examStart && startDateInput.valueAsDate) {
            examStart = startDateInput.valueAsDate.toISOString().split('T')[0];
        }
        if (!examEnd && endDateInput.valueAsDate) {
            examEnd = endDateInput.valueAsDate.toISOString().split('T')[0];
        }

        // Validate inputs
        if (!schoolName) {
            alert('Please enter school name');
            return;
        }
        if (includeMotto && !schoolMotto) {
            alert('Please enter school motto');
            return;
        }
        if (!schoolAddress) {
            alert('Please enter school address');
            return;
        }
        if (!schoolContact) {
            alert('Please enter school contact');
            return;
        }
        if (!className) {
            alert('Please enter default class');
            return;
        }
        if (!examStart) {
            alert('Please select exam start date');
            return;
        }
        if (!examEnd) {
            alert('Please select exam end date');
            return;
        }
        const startDate = new Date(examStart);
        const endDate = new Date(examEnd);
        if (isNaN(startDate.getTime())) {
            alert('Invalid exam start date');
            return;
        }
        if (isNaN(endDate.getTime())) {
            alert('Invalid exam end date');
            return;
        }
        if (startDate > endDate) {
            alert('Start date must be before or equal to end date');
            return;
        }
        if (!teacherPhone) {
            alert('Please enter class teacher phone number');
            return;
        }

        // Collect and validate schedule
        examSchedule = [];
        const subjectRows = scheduleInputs.querySelectorAll('.schedule-input-row');
        for (const row of subjectRows) {
            const subject = row.querySelector('.subject-input').value.trim();
            const date = row.querySelector('.subject-date').value;
            if (!subject || !date) {
                alert('Please fill in all subject names and dates');
                return;
            }
            const examDate = new Date(date);
            if (examDate < startDate || examDate > endDate) {
                alert(`Exam date for ${subject} must be between ${formatDate(examStart)} and ${formatDate(examEnd)}`);
                return;
            }
            examSchedule.push({ subject, date });
        }
        if (examSchedule.length === 0 && !columnMap.schedule) {
            alert('Please add at least one subject to the exam schedule or map a schedule column');
            return;
        }

        // Format dates and calculate day numbers
        const formattedStartDate = formatDate(examStart);
        const formattedEndDate = formatDate(examEnd);
        const examDates = `${formattedStartDate} - ${formattedEndDate}`;
        const uniqueDates = [...new Set(examSchedule.map(item => item.date))].sort();
        const dayMap = {};
        uniqueDates.forEach((date, index) => {
            dayMap[date] = getDayLabel(index);
        });
        
        previewArea.innerHTML = '';
        const fragment = document.createDocumentFragment();
        const fronts = document.createElement('div');
        fronts.id = 'fronts';
        const backs = document.createElement('div');
        backs.id = 'backs';

        // Generate fronts
        studentData.forEach((student, index) => {
            if (index < currentPage * cardsPerPage || index >= (currentPage + 1) * cardsPerPage) return;
            const frontCard = frontTemplate.content.cloneNode(true);
            if (schoolLogo) {
                frontCard.querySelector('.school-logo').src = schoolLogo;
                frontCard.querySelector('.school-logo').alt = `${schoolName} Logo`;
            }
            frontCard.querySelector('.school-name').textContent = schoolName;
            if (includeMotto) {
                frontCard.querySelector('.motto').textContent = `"${schoolMotto}"`;
            } else {
                frontCard.querySelector('.motto').remove();
            }
            frontCard.querySelector('.address').textContent = schoolAddress;
            frontCard.querySelector('.student-name').textContent = student[columnMap.name] || '';
            frontCard.querySelector('.student-roll').textContent = student[columnMap.roll] || '';
            frontCard.querySelector('.student-class').textContent = `${student[columnMap.class] || className}-${student[columnMap.section] || ''}`;
            if (includeGuardianContact) {
                frontCard.querySelector('.student-guardian').textContent = student[columnMap.guardian] || '';
                frontCard.querySelector('.student-contact').textContent = student[columnMap.guardianContact] || '';
            } else {
                frontCard.querySelector('.guardian-field').remove();
                frontCard.querySelector('.guardian-contact-field').remove();
            }
            frontCard.querySelector('.exam-dates').textContent = examDates;
            if (includePhotos) {
                const photoContainer = document.createElement('div');
                photoContainer.className = 'student-photo';
                if (studentPhotos[student[columnMap.roll]]) {
                    photoContainer.innerHTML = `<img src="${studentPhotos[student[columnMap.roll]]}" alt="${student[columnMap.name]} Photo">`;
                } else {
                    photoContainer.innerHTML = '<span>Photo Not Available</span>';
                }
                frontCard.querySelector('.front-card').appendChild(photoContainer);
            }
            if (principalSignature) {
                frontCard.querySelector('.principal-sig').innerHTML = 
                    `<img src="${principalSignature}" alt="Principal Signature"><p>Principal</p>`;
            }
            if (coordinatorSignature) {
                frontCard.querySelector('.coordinator-sig').innerHTML = 
                    `<img src="${coordinatorSignature}" alt="Exam Coordinator Signature"><p>Exam Coordinator</p>`;
            }
            fronts.appendChild(frontCard);
        });

        // Generate two identical back cards for top and bottom halves
        const studentSchedule = columnMap.schedule && studentData[0] && studentData[0][columnMap.schedule] ? 
            JSON.parse(studentData[0][columnMap.schedule]) : examSchedule;
        
        let scheduleHTML = '';
        for (let i = 0; i < studentSchedule.length; i += 2) {
            const item1 = studentSchedule[i];
            const item2 = studentSchedule[i+1];
            
            const dayLabel1 = dayMap[item1.date] || 'Day Unknown';
            const weekday1 = getWeekday(item1.date, startDayIndex);
            const date1 = formatDate(item1.date).slice(0, -5);
            const cell1 = `${dayLabel1} | ${item1.subject} | ${weekday1} ${date1}`;
            
            let cell2 = '';
            if (item2) {
                const dayLabel2 = dayMap[item2.date] || 'Day Unknown';
                const weekday2 = getWeekday(item2.date, startDayIndex);
                const date2 = formatDate(item2.date).slice(0, -5);
                cell2 = `${dayLabel2} | ${item2.subject} | ${weekday2} ${date2}`;
            }
            
            scheduleHTML += `
                <tr>
                    <td>${cell1}</td>
                    <td>${cell2}</td>
                </tr>
            `;
        }

        // Create two back cards
        for (let i = 0; i < 2; i++) {
            const backCard = backTemplate.content.cloneNode(true);
            backCard.querySelector('.schedule-body').innerHTML = scheduleHTML;
            backCard.querySelector('.teacher-phone').textContent = `Phone: ${teacherPhone}`;
            if (includeTeacherSig && teacherSignature) {
                backCard.querySelector('.teacher-sig img').src = teacherSignature;
            } else {
                backCard.querySelector('.teacher-sig img').remove();
            }
            backCard.querySelector('.admit-card').classList.add(i === 0 ? 'back-top' : 'back-bottom');
            backs.appendChild(backCard);
        }

        fragment.appendChild(fronts);
        fragment.appendChild(backs);
        previewArea.appendChild(fragment);
        previewArea.style.height = 'auto';

        // Update pagination
        const totalPages = Math.ceil(studentData.length / cardsPerPage);
        prevPage.disabled = currentPage === 0;
        nextPage.disabled = currentPage === totalPages - 1;
    }

    function changePage(direction) {
        currentPage += direction;
        generateAdmitCards();
    }

    function showPrintConfirm() {
        if (previewArea.children.length === 0) {
            alert('Please generate admit cards first');
            return;
        }
        const classCounts = {};
        studentData.forEach(student => {
            const cls = columnMap.class ? student[columnMap.class] || document.getElementById('classInput').value : document.getElementById('classInput').value;
            classCounts[cls] = (classCounts[cls] || 0) + 1;
        });
        const summary = Object.entries(classCounts).map(([cls, count]) => `${count} students in Class ${cls}`).join(', ');
        const frontPages = Math.ceil(studentData.length / 2);
        document.getElementById('printSummary').textContent = `Printing ${summary}. Total: ${frontPages} front pages, ${frontPages} back pages.`;
        printConfirmModal.style.display = 'block';
    }

    function printAdmitCards() {
        if (previewArea.children.length === 0) {
            alert('Please generate admit cards first');
            return;
        }
        currentPage = 0;
        generateAdmitCards();
        window.print();
    }

    async function generatePDF() {
        if (previewArea.children.length === 0) {
            alert('Please generate admit cards first');
            return;
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
        currentPage = 0;
        generateAdmitCards();
        const frontCards = previewArea.querySelectorAll('#fronts .admit-card');
        for (let i = 0; i < frontCards.length; i++) {
            const canvas = await html2canvas(frontCards[i], { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            doc.addImage(imgData, 'PNG', 0, (i % 2) * (148.5 + 10), 210, 148.5);
            if (i < frontCards.length - 1 && (i + 1) % 2 === 0) {
                doc.addPage();
            }
        }
        const backCards = previewArea.querySelectorAll('#backs .admit-card');
        if (backCards.length > 0) {
            doc.addPage();
            for (let i = 0; i < Math.min(backCards.length, 2); i++) {
                const canvas = await html2canvas(backCards[i], { scale: 2, useCORS: true });
                const imgData = canvas.toDataURL('image/png');
                doc.addImage(imgData, 'PNG', 0, i * (148.5 + 10), 210, 148.5);
            }
        }
        doc.save('admit_cards.pdf');
    }

    function resetForm() {
        if (confirm('Are you sure you want to reset all data?')) {
            document.querySelectorAll('input[type="text"], input[type="date"], input[type="file"], input[type="tel"], select').forEach(input => {
                input.value = '';
            });
            document.getElementById('schoolName').value = 'BAGMATI SECONDARY SCHOOL';
            document.getElementById('schoolMotto').value = 'Quality education is our Motto';
            document.getElementById('schoolAddress').value = 'Chandrapur-1, Rautahat';
            document.getElementById('schoolContact').value = '9876543210';
            document.getElementById('classInput').value = '10';
            document.getElementById('teacherPhone').value = '9876543210';
            includePhotosCheck.checked = false;
            document.getElementById('includeMotto').checked = true;
            document.getElementById('includeGuardianContact').checked = true;
            document.getElementById('includeTeacherSig').checked = false;
            photoUploadContainer.style.display = 'none';
            scheduleInputs.innerHTML = '';
            columnMappingModal.style.display = 'none';
            printConfirmModal.style.display = 'none';
            previewArea.innerHTML = '';
            schoolLogo = null;
            principalSignature = null;
            coordinatorSignature = null;
            teacherSignature = null;
            studentData = [];
            studentPhotos = {};
            examSchedule = [];
            columnMap = {};
            currentPage = 0;
        }
    }
});