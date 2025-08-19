// Elements
const estdInput = document.getElementById('estd');
const iemisInput = document.getElementById('iemis');
const fileInput = document.getElementById('fileInput');
const logoInput = document.getElementById('logoInput');
const loadSampleBtn = document.getElementById('loadSampleBtn');
const generateBtn = document.getElementById('generateBtn');
const printBtn = document.getElementById('printBtn');
const clearBtn = document.getElementById('clearBtn');
const printArea = document.getElementById('printArea');
const addSubjectBtn = document.getElementById('addSubjectBtn');
const resetGradeScaleBtn = document.getElementById('resetGradeScaleBtn');
const subjectContainer = document.getElementById('subjectContainer');
const gradeScaleContainer = document.getElementById('gradeScaleContainer');
const displayModeToggle = document.getElementById('displayModeToggle');
const showPercentageToggle = document.getElementById('showPercentageToggle');

const schoolNameInput = document.getElementById('schoolName');
const schoolMottoInput = document.getElementById('schoolMotto');
const schoolAddressInput = document.getElementById('schoolAddress');
const classInput = document.getElementById('classInput');
const termInput = document.getElementById('termInput');
const yearInput = document.getElementById('yearInput');
const issueDayInput = document.getElementById('issueDay');
const issueMonthInput = document.getElementById('issueMonth');
const issueYearInput = document.getElementById('issueYear');
const passTheoryInput = document.getElementById('passTheory');
const passPracticalInput = document.getElementById('passPractical');
const fullTheoryInput = document.getElementById('fullTheory');
const fullPracticalInput = document.getElementById('fullPractical');

// Keep imported rows here
let importedData = [];

// Default credit hours
let creditHourMap = {
  'Mathematics': 5,
  'Science': 4,
  'English': 4,
  'Nepali': 3,
  'Social Studies': 4
};

// Default grade scale
let gradeScale = [
  { grade: 'A+', min: 90, max: 100, gp: 4.0 },
  { grade: 'A', min: 80, max: 90, gp: 3.6 },
  { grade: 'B+', min: 70, max: 80, gp: 3.2 },
  { grade: 'B', min: 60, max: 70, gp: 2.8 },
  { grade: 'C+', min: 50, max: 60, gp: 2.4 },
  { grade: 'C', min: 40, max: 50, gp: 2.0 },
  { grade: 'D', min: 35, max: 40, gp: 1.6 },
  { grade: 'NG', min: 0, max: 35, gp: 0.0 }
];

// Initialize the app
function initApp() {
  renderBlankPreview();
  initSubjectManagement();
  renderGradeScale();
  
  // Load logo if available
  const logoUrl = localStorage.getItem('schoolLogo');
  if (logoUrl) {
    document.querySelectorAll('.logo-img').forEach(img => {
      img.src = logoUrl;
      img.style.display = 'block';
    });
  }
}

// Input validation
function validateInputs() {
  const errors = [];
  
  // Required field validation
  if (!schoolNameInput.value.trim()) errors.push("School name is required");
  if (!schoolMottoInput.value.trim()) errors.push("School motto is required");
  if (!schoolAddressInput.value.trim()) errors.push("School address is required");
  if (!classInput.value.trim()) errors.push("Class/Grade is required");
  if (!termInput.value.trim()) errors.push("Term is required");
  if (!yearInput.value.trim()) errors.push("Year is required");
  
  // Date validation
  if (isNaN(issueDayInput.value)) errors.push("Day must be a number");
  if (isNaN(issueMonthInput.value)) errors.push("Month must be a number");
  if (isNaN(issueYearInput.value)) errors.push("Year must be a number");
  
  if (issueDayInput.value < 1 || issueDayInput.value > 32) {
    errors.push("Day must be between 1-32");
  }
  if (issueMonthInput.value < 1 || issueMonthInput.value > 12) {
    errors.push("Month must be between 1-12");
  }
  if (issueYearInput.value < 2000 || issueYearInput.value > 2100) {
    errors.push("Year must be between 2000-2100");
  }
  
  // Numeric validation
  if (isNaN(passTheoryInput.value)) errors.push("Theory pass marks must be a number");
  if (isNaN(passPracticalInput.value)) errors.push("Practical pass marks must be a number");
  if (isNaN(fullTheoryInput.value)) errors.push("Theory full marks must be a number");
  if (isNaN(fullPracticalInput.value)) errors.push("Practical full marks must be a number");
  
  // Range validation
  if (passTheoryInput.value < 0 || passTheoryInput.value > 100) {
    errors.push("Theory pass marks must be between 0-100");
  }
  if (passPracticalInput.value < 0 || passPracticalInput.value > 100) {
    errors.push("Practical pass marks must be between 0-100");
  }
  if (fullTheoryInput.value < 0 || fullTheoryInput.value > 100) {
    errors.push("Theory full marks must be between 0-100");
  }
  if (fullPracticalInput.value < 0 || fullPracticalInput.value > 100) {
    errors.push("Practical full marks must be between 0-100");
  }
  
  // Check that theory + practical doesn't exceed 100
  const totalFull = parseInt(fullTheoryInput.value) + parseInt(fullPracticalInput.value);
  if (totalFull > 100) {
    errors.push("Theory + Practical full marks cannot exceed 100");
  }
  
  // Subject validation
  if (Object.keys(creditHourMap).length === 0) {
    errors.push("At least one subject is required");
  }
  
  return errors;
}

// Subject management
function initSubjectManagement() {
  // Clear existing inputs
  subjectContainer.innerHTML = '';
  
  // Add default subjects
  Object.entries(creditHourMap).forEach(([subject, hours]) => {
    addSubjectInput(subject, hours);
  });
}

function addSubjectInput(subject = '', hours = 3) {
  const div = document.createElement('div');
  div.className = 'subject-input';
  div.innerHTML = `
    <input type="text" class="subject-name" value="${subject}" placeholder="Subject name">
    <input type="text" class="subject-hours" value="${hours}"  placeholder="Credit hours">
    <button type="button" class="remove-subject-btn">×</button>
  `;
  subjectContainer.appendChild(div);
  
  div.querySelector('.remove-subject-btn').addEventListener('click', () => {
    div.remove();
    updateCreditHourMap();
  });
  
  // Update on changes
  div.querySelector('.subject-name').addEventListener('change', updateCreditHourMap);
  div.querySelector('.subject-hours').addEventListener('change', updateCreditHourMap);
}

function updateCreditHourMap() {
  creditHourMap = {};
  document.querySelectorAll('.subject-input').forEach(subjDiv => {
    const name = subjDiv.querySelector('.subject-name').value.trim();
    const hours = subjDiv.querySelector('.subject-hours').value.trim();
    if (name && hours) {
      creditHourMap[name] = hours;
    }
  });
}

// Grade scale management
function renderGradeScale() {
  gradeScaleContainer.innerHTML = '';
  gradeScale.forEach((grade, i) => {
    const div = document.createElement('div');
    div.className = 'grade-scale-input';
    div.innerHTML = `
      <input type="text" class="grade-letter" value="${grade.grade}">
      <input type="number" class="grade-min" value="${grade.min}"> -
      <input type="number" class="grade-max" value="${grade.max}">
      GPA: <input type="number" step="0.1" class="grade-gp" value="${grade.gp}">
      ${i === gradeScale.length - 1 ? '' : '<button type="button" class="remove-grade-btn">×</button>'}
    `;
    gradeScaleContainer.appendChild(div);
    
    if (div.querySelector('.remove-grade-btn')) {
      div.querySelector('.remove-grade-btn').addEventListener('click', () => {
        gradeScale.splice(i, 1);
        renderGradeScale();
      });
    }
    
    // Update on changes
    div.querySelector('.grade-letter').addEventListener('change', updateGradeScale);
    div.querySelector('.grade-min').addEventListener('change', updateGradeScale);
    div.querySelector('.grade-max').addEventListener('change', updateGradeScale);
    div.querySelector('.grade-gp').addEventListener('change', updateGradeScale);
  });
}

function updateGradeScale() {
  gradeScale = [];
  document.querySelectorAll('.grade-scale-input').forEach(gradeDiv => {
    gradeScale.push({
      grade: gradeDiv.querySelector('.grade-letter').value,
      min: parseInt(gradeDiv.querySelector('.grade-min').value),
      max: parseInt(gradeDiv.querySelector('.grade-max').value),
      gp: parseFloat(gradeDiv.querySelector('.grade-gp').value)
    });
  });
}

// Load logo preview
logoInput.addEventListener('change', (e) => {
  const f = e.target.files[0];
  if (!f) return;
  
  // Validate file type
  if (!f.type.match('image.*')) {
    alert('Please select an image file (JPEG, PNG, etc.)');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = () => {
    localStorage.setItem('schoolLogo', reader.result);
    // Update any existing previews
    const logoImgs = document.querySelectorAll('.logo-img');
    logoImgs.forEach(img => {
      img.src = reader.result;
      img.style.display = 'block';
    });
  };
  reader.onerror = () => {
    alert('Error loading image file');
  };
  reader.readAsDataURL(f);
});

// Load sample data
loadSampleBtn.addEventListener('click', () => {
  const subjects = Object.keys(creditHourMap);
  if (subjects.length === 0) {
    alert('Please add some subjects first');
    return;
  }
  
  importedData = [];
  for (let i = 1; i <= 10; i++) {
    const row = {
      Roll: i,
      Name: `Student ${i}`,
      Term: termInput.value || 'First Term',
      Year: yearInput.value || '2081',
      IssueDate: `${issueYearInput.value}-${issueMonthInput.value}-${issueDayInput.value}`,
      TotalDays: 220,
      Present: 210 - i,
      Absent: 10 + i,
      Remarks: i % 2 ? 'Needs improvement' : 'Good'
    };
    
    subjects.forEach((s, idx) => {
      const base = s.replace(/\s+/g,'_');
      row[`Subject_${base}`] = s;
      row[`Subject_${base}_TH`] = Math.max(0, 90 - i*3 - idx);
      row[`Subject_${base}_PR`] = Math.max(0, 18 - (i % 5));
    });
    
    importedData.push(row);
  }
  
  alert('Sample data loaded (10 students). Click Generate Results.');
});

// File parsing
fileInput.addEventListener('change', (ev) => {
  const file = ev.target.files[0];
  if (!file) return;
  
  const name = file.name.toLowerCase();
  const fileSizeMB = file.size / (1024 * 1024);
  
  // File size validation
  if (fileSizeMB > 5) {
    alert("File too large. Maximum size is 5MB.");
    return;
  }
  
  try {
    if (name.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (res) => {
          if (res.errors.length > 0) {
            alert(`CSV parsing errors:\n${res.errors.map(e => e.message).join("\n")}`);
            return;
          }
          if (!res.data || res.data.length === 0) {
            alert("CSV file is empty or couldn't be parsed");
            return;
          }
          
          // Validate required columns
          if (!res.meta.fields.includes('Roll') && !res.meta.fields.includes('roll')) {
            alert("CSV must contain a 'Roll' column");
            return;
          }
          
          importedData = res.data;
          alert(`Successfully loaded CSV with ${importedData.length} student records`);
        },
        error: (error) => {
          alert(`CSV parsing failed: ${error.message}`);
        }
      });
    } else if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const first = workbook.SheetNames[0];
          const sheet = workbook.Sheets[first];
          importedData = XLSX.utils.sheet_to_json(sheet, { defval: '' });
          
          if (!importedData || importedData.length === 0) {
            alert("Excel file is empty or couldn't be parsed");
            return;
          }
          
          // Check for required columns
          const firstRow = importedData[0];
          if (!('Roll' in firstRow) && !('roll' in firstRow)) {
            alert("Excel file must contain a 'Roll' column");
            return;
          }
          
          alert(`Successfully loaded Excel with ${importedData.length} student records`);
        } catch (e) {
          alert(`Excel parsing failed: ${e.message}`);
        }
      };
      reader.onerror = () => {
        alert("Error reading Excel file");
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert('Unsupported file type. Please upload a .csv or .xlsx file.');
    }
  } catch (e) {
    alert(`Error processing file: ${e.message}`);
  }
});

// Helpers
function toNum(v) { 
  const n = parseFloat(String(v || '').replace(/,/g,'')); 
  return isNaN(n) ? 0 : n; 
}

function gradeFromPercent(p) {
  p = Math.min(100, Math.max(0, p)); // Clamp between 0-100
  for (const grade of gradeScale) {
    if (p >= grade.min && p <= grade.max) {
      return { grade: grade.grade, gp: grade.gp };
    }
  }
  return { grade: 'NG', gp: 0.0 }; // Default if no match
}

function remarkFromGP(gp) {
  if (gp >= 3.6) return 'Excellent';
  if (gp >= 3.2) return 'Very Good';
  if (gp >= 2.8) return 'Good';
  if (gp >= 2.4) return 'Satisfactory';
  if (gp >= 2.0) return 'Pass';
  return 'Needs Improvement';
}

// Detect subjects
function detectSubjectsFromHeaders(row) {
  const keys = Object.keys(row);
  const subjMap = {};

  keys.forEach(k => {
    const m = k.match(/^Subject_(.+?)(_TH|_PR)?$/i);
    if (m) {
      const base = m[1];
      if (!subjMap[base]) subjMap[base] = {};
      if (m[2] && m[2].toUpperCase() === '_TH') subjMap[base].thKey = k;
      else if (m[2] && m[2].toUpperCase() === '_PR') subjMap[base].prKey = k;
      else subjMap[base].nameKey = k;
    }
  });

  const order = [];
  keys.forEach(k => {
    for (const base in subjMap) {
      const s = subjMap[base];
      if (s.nameKey === k || s.thKey === k || s.prKey === k) {
        if (!order.includes(base)) order.push(base);
      }
    }
  });

  return order.map(base => {
    const s = subjMap[base];
    return { base, nameKey: s.nameKey || null, thKey: s.thKey || null, prKey: s.prKey || null };
  });
}

// Render blank preview
function renderBlankPreview() {
  const tpl = document.getElementById('marksheet-template');
  const clone = tpl.content.cloneNode(true);
  clone.querySelector('.school-name').textContent = schoolNameInput.value;
  clone.querySelector('.motto').textContent = `"${schoolMottoInput.value}"`;
  clone.querySelector('.address').textContent = schoolAddressInput.value;
  clone.querySelector('.estd').textContent = estdInput.value;
  clone.querySelector('.iemis').textContent = iemisInput.value;
  clone.querySelector('.st-class').textContent = classInput.value;
  clone.querySelector('.st-term').textContent = termInput.value;
  clone.querySelector('.st-year').textContent = yearInput.value;
  clone.querySelector('.issue-date').textContent = 
    `${issueYearInput.value}-${issueMonthInput.value}-${issueDayInput.value}`;
  
  // Add logo if available
  const logoImg = clone.querySelector('.logo-img');
  const logoUrl = localStorage.getItem('schoolLogo');
  if (logoUrl) {
    logoImg.src = logoUrl;
    logoImg.style.display = 'block';
  }
  
  printArea.innerHTML = '';
  printArea.appendChild(clone);
}

// Live preview updates
function updatePreview() {
  const schoolName = schoolNameInput.value;
  const motto = schoolMottoInput.value;
  const address = schoolAddressInput.value;
  const estd = estdInput.value;          // New line
  const iemis = iemisInput.value; 
  const cls = classInput.value;
  const term = termInput.value;
  const year = yearInput.value;
  const issueDate = `${issueYearInput.value}-${issueMonthInput.value}-${issueDayInput.value}`;

  const marksheets = printArea.querySelectorAll('.marksheet');
  marksheets.forEach(sheet => {
    sheet.querySelector('.school-name').textContent = schoolName;
    sheet.querySelector('.motto').textContent = `"${motto}"`;
    sheet.querySelector('.address').textContent = address;
    sheet.querySelector('.estd').textContent = estd;
    sheet.querySelector('.iemis').textContent = iemis;
    sheet.querySelector('.st-class').textContent = cls;
    sheet.querySelector('.st-term').textContent = term;
    sheet.querySelector('.st-year').textContent = year;
    sheet.querySelector('.issue-date').textContent = issueDate;
  });
}

// Event listeners
estdInput.addEventListener('input', updatePreview);
iemisInput.addEventListener('input', updatePreview);
schoolNameInput.addEventListener('input', updatePreview);
schoolMottoInput.addEventListener('input', updatePreview);
schoolAddressInput.addEventListener('input', updatePreview);
classInput.addEventListener('input', updatePreview);
termInput.addEventListener('input', updatePreview);
yearInput.addEventListener('input', updatePreview);
issueDayInput.addEventListener('change', updatePreview);
issueMonthInput.addEventListener('change', updatePreview);
issueYearInput.addEventListener('change', updatePreview);
addSubjectBtn.addEventListener('click', () => addSubjectInput());
resetGradeScaleBtn.addEventListener('click', () => {
  gradeScale = [
    { grade: 'A+', min: 90, max: 100, gp: 4.0 },
    { grade: 'A', min: 80, max: 90, gp: 3.6 },
    { grade: 'B+', min: 70, max: 80, gp: 3.2 },
    { grade: 'B', min: 60, max: 70, gp: 2.8 },
    { grade: 'C+', min: 50, max: 60, gp: 2.4 },
    { grade: 'C', min: 40, max: 50, gp: 2.0 },
    { grade: 'D', min: 35, max: 40, gp: 1.6 },
    { grade: 'NG', min: 0, max: 35, gp: 0.0 }
  ];
  renderGradeScale();
});

displayModeToggle.addEventListener('change', () => {
  if (importedData.length > 0) {
    generateBtn.click(); // Regenerate if we have data
  }
});

showPercentageToggle.addEventListener('change', () => {
  if (importedData.length > 0) {
    generateBtn.click(); // Regenerate if we have data
  }
});

// Main generate function
generateBtn.addEventListener('click', () => {
  const validationErrors = validateInputs();
  if (validationErrors.length > 0) {
    alert("Validation errors:\n" + validationErrors.join("\n"));
    return;
  }

  if (!importedData || importedData.length === 0) {
    alert('No data loaded. Upload Excel/CSV or click Load Sample.');
    return;
  }

  const subjects = detectSubjectsFromHeaders(importedData[0]);
  if (subjects.length === 0) {
    alert('No subjects detected in file. Ensure headers have Subject_... or "... Theory"/"... Practical".');
    return;
  }

  const passTheory = toNum(passTheoryInput.value);
  const passPractical = toNum(passPracticalInput.value);
  const fullTheory = toNum(fullTheoryInput.value);
  const fullPractical = toNum(fullPracticalInput.value);

  const students = importedData.map(row => {
    const name = row['Name'] || row['name'] || '';
    const roll = row['Roll'] || row['roll'] || row['Roll No'] || row['RollNo'] || '';
    const term = row['Term'] || termInput.value || '';
    const year = row['Year'] || yearInput.value || '';
    const issueDate = row['IssueDate'] || row['Issue Date'] || row['Issue'] || 
      `${issueYearInput.value}-${issueMonthInput.value}-${issueDayInput.value}`;
    const totalDays = row['TotalDays'] || row['Total Days'] || '';
    const present = row['Present'] || row['PresentDays'] || row['Present Days'] || '';
    const absent = row['Absent'] || row['AbsentDays'] || row['Absent Days'] || '';
    const remarks = row['Remarks'] || '';

    const subjArr = subjects.map((s) => {
      let displayName = '';
      if (s.nameKey && row[s.nameKey]) displayName = row[s.nameKey];
      else displayName = s.base.replace(/_/g,' ').trim();

      const thRaw = s.thKey ? toNum(row[s.thKey]) : 0;
      const prRaw = s.prKey ? toNum(row[s.prKey]) : 0;
      
      // Convert raw marks to percentages based on full marks
      const thPercent = fullTheory > 0 ? (thRaw / fullTheory) * 100 : 0;
      const prPercent = fullPractical > 0 ? (prRaw / fullPractical) * 100 : 0;
      const totalPercent = (thPercent * (fullTheory/100)) + (prPercent * (fullPractical/100));

      let thGrade = { grade: 'NG', gp: 0 };
      let prGrade = gradeFromPercent(prPercent);

      if (thRaw >= passTheory) {
        thGrade = gradeFromPercent(thPercent);
      }

      let finalGrade;
      if (thRaw >= passTheory && prRaw >= passPractical) {
          finalGrade = gradeFromPercent(totalPercent);
      } else {
          finalGrade = { grade: 'NG', gp: 0 };
      }

      const pass = (thRaw >= passTheory) && (prRaw >= passPractical);
      const creditHours = creditHourMap[displayName] ?? '3';

      return {
        subject: displayName,
        creditHours,
        thRaw, prRaw, 
        thPercent, prPercent, totalPercent,
        thLetter: thGrade.grade,
        prLetter: prGrade.grade,
        grade: finalGrade.grade,
        gp: finalGrade.gp,
        pass,
        remark: remarkFromGP(finalGrade.gp)
      };
    });

    const totalMarks = subjArr.reduce((a,b) => a + b.totalPercent, 0);
    const numSubjects = subjArr.length;
    const totalMax = numSubjects * 100;
    const avgGPA = subjArr.length ? (subjArr.reduce((a,b) => a + b.gp,0) / subjArr.length) : 0;
    const anyFail = subjArr.some(s => !s.pass);
    const result = anyFail ? 'Fail' : 'Pass';

    return {
      name, roll, term, year, issueDate, totalDays, present, absent, remarks,
      subjects: subjArr,
      totalMarks, totalMax, avgGPA, result
    };
  });

  // Separate passed and failed students
  const passedStudents = students.filter(s => s.result === 'Pass');
  const failedStudents = students.filter(s => s.result === 'Fail');

  // Sort only passed students
  passedStudents.sort((a, b) => {
    if (b.avgGPA !== a.avgGPA) return b.avgGPA - a.avgGPA;
    return b.totalMarks - a.totalMarks;
  });

  // Assign ranks only to passed students
  passedStudents.forEach((s, i) => s.rank = i + 1);
  failedStudents.forEach(s => s.rank = '-');

  // Combine students (passed first)
  const allStudents = [...passedStudents, ...failedStudents];

  // Render marksheets
  printArea.innerHTML = '';
  allStudents.forEach(stu => {
    const tpl = document.getElementById('marksheet-template');
    const clone = tpl.content.cloneNode(true);

    // Add logo if available
    const logoImg = clone.querySelector('.logo-img');
    const logoUrl = localStorage.getItem('schoolLogo');
    if (logoUrl) {
      logoImg.src = logoUrl;
      logoImg.style.display = 'block';
    }

    // Update school info
    clone.querySelector('.school-name').textContent = schoolNameInput.value;
    clone.querySelector('.motto').textContent = `"${schoolMottoInput.value}"`;
    clone.querySelector('.address').textContent = schoolAddressInput.value;

    // Update student info
    clone.querySelector('.st-name').textContent = stu.name;
    clone.querySelector('.st-class').textContent = classInput.value;
    clone.querySelector('.st-roll').textContent = stu.roll;
    clone.querySelector('.st-term').textContent = stu.term;
    clone.querySelector('.st-year').textContent = stu.year;

    const tbody = clone.querySelector('.marks-body');
    stu.subjects.forEach((sub, idx) => {
      const tr = document.createElement('tr');
      
      // Determine what to display based on toggle
      const showGrades = displayModeToggle.checked;
      const thDisplay = showGrades ? sub.thLetter : sub.thRaw;
      const prDisplay = showGrades ? sub.prLetter : sub.prRaw;
      
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td style="text-align:left;padding-left:6px">${sub.subject}</td>
        <td>${sub.creditHoursDisplay || sub.creditHours}</td>
        <td>${thDisplay}</td>
        <td>${prDisplay}</td>
        <td>${sub.grade}</td>
        <td>${sub.gp.toFixed(2)}</td>
        <td>${sub.remark}</td>
      `;
      tbody.appendChild(tr);
    });

    // Update summary row to optionally show percentage
    const showPercentage = showPercentageToggle.checked;
    const gpaEl = clone.querySelector('.st-gpa');
    gpaEl.textContent = stu.avgGPA.toFixed(2);
    if (showPercentage) {
      const percentage = (stu.totalMarks / stu.totalMax * 100).toFixed(2);
      gpaEl.textContent += ` (${percentage}%)`;
    }

    clone.querySelector('.st-rank').textContent = stu.rank === '-' ? '-' : `${stu.rank} / ${passedStudents.length}`;

    const totalMarksEl = clone.querySelector('.st-total-marks');
    const totalMaxEl = clone.querySelector('.st-total-max');
    totalMarksEl.textContent = Math.round(stu.totalMarks);
    totalMaxEl.textContent = stu.totalMax;

    clone.querySelector('.att-total').textContent = stu.totalDays;
    clone.querySelector('.att-present').textContent = stu.present;
    clone.querySelector('.att-absent').textContent = stu.absent;
    clone.querySelector('.issue-date').textContent = stu.issueDate;

    printArea.appendChild(clone);
  });

  alert(`Generated ${allStudents.length} marksheet(s). ${passedStudents.length} passed, ${failedStudents.length} failed.`);
});

// Print
printBtn.addEventListener('click', () => window.print());

// Clear
clearBtn.addEventListener('click', () => {
  if (!confirm('Clear preview and stored logo?')) return;
  printArea.innerHTML = '';
  localStorage.removeItem('schoolLogo');
  renderBlankPreview();
});

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);