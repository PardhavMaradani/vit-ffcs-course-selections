var slotConflicts = {
    "A1": ["L1", "L14"], "L1": ["A1"], "L14": ["A1"],
    "B1": ["L7", "L20"], "L7": ["B1"], "L20": ["B1"],
    "C1": ["L13", "L26"], "L13": ["C1"], "L26": ["C1"],
    "D1": ["L3", "L19"], "L3": ["D1"], "L19": ["D1"],
    "E1": ["L9", "L25"], "L9": ["E1"], "L25": ["E1"],
    "F1": ["L2", "L15"], "L2": ["F1"], "L15": ["F1"],
    "G1": ["L8", "L21"], "L8": ["G1"], "L21": ["G1"],
    "A2": ["L31", "L44"], "L31": ["A2"], "L44": ["A2"],
    "B2": ["L37", "L50"], "L37": ["B2"], "L50": ["B2"],
    "C2": ["L43", "L56"], "L43": ["C2"], "L56": ["C2"],
    "D2": ["L33", "L49"], "L33": ["D2"], "L49": ["D2"],
    "E2": ["L39", "L55"], "L39": ["E2"], "L55": ["E2"],
    "F2": ["L32", "L45"], "L32": ["F2"], "L45": ["F2"],
    "G2": ["L38", "L51"], "L38": ["G2"], "L51": ["G2"],

    "TA1": ["L27"], "L27": ["TA1"],
    "TB1": ["L4"], "L4": ["TB1"],
    "TC1": ["L10"], "L10": ["TC1"],
    "TD1": ["L29"], "L29": ["TD1"],
    "TE1": ["L22"], "L22": ["TE1"],
    "TF1": ["L28"], "L28": ["TF1"],
    "TG1": ["L5"], "L5": ["TG1"],

    "TA2": ["L57"], "L57": ["TA2"],
    "TB2": ["L34"], "L34": ["TB2"],
    "TC2": ["L40"], "L40": ["TC2"],
    "TD2": ["L46"], "L46": ["TD2"],
    "TE2": ["L52"], "L52": ["TE2"],
    "TF2": ["L58"], "L58": ["TF2"],
    "TG2": ["L35"], "L35": ["TG2"],

    "TAA1": ["L11"], "L11": ["TAA1"],
    "TAA2": ["L41"], "L41": ["TAA2"],
    "TBB2": ["L47"], "L47": ["TBB2"],
    "TCC1": ["L23"], "L23": ["TCC1"],
    "TCC2": ["L53"], "L53": ["TCC2"],
    "TDD2": ["L59"], "L59": ["TDD2"],
    "V1": ["L16"], "L16": ["V1"],
    "V2": ["L17"], "L17": ["V2"],
};

var selections = {};
var courseList = {};

function clickAndCallbackCode() {
    return `
        const nativeFetch = window.fetch;
        window.fetch = function(...args) {
            return nativeFetch.apply(window, args).finally(() => {
                window.fetch = nativeFetch;
                setTimeout(function() { window.dispatchEvent(new CustomEvent('reset')) }, 500);
            });
        }
        $(document).ajaxStop(function () {
            window.fetch = nativeFetch;
            $(this).unbind('ajaxStop');
            window.dispatchEvent(new CustomEvent('reset'));
        });
        this.click();
        this.removeAttribute('onreset');
    `;
}
function elementClick(element, callback) {
    if (!element) {
        return;
    }
    window.onreset = callback;
    element.setAttribute("onreset", clickAndCallbackCode());
    element.dispatchEvent(new CustomEvent("reset"));
}

function menuLinkClick(url, callback) {
    const element = document.querySelector('a[data-url="' + url + '"]');
    elementClick(element, callback);
}

function gotoCourseAllocation() {
    menuLinkClick("academics/common/StudentRegistrationScheduleAllocation", () => {
    });
}

function getCourseId(checkbox) {
    const courseName = document.getElementById("courseId").value;
    const curCat = document.getElementById("curriculumCategory").value;
    const parent = checkbox.parentElement;
    const slots = parent.innerText.trim().split('+');
    const venue = parent.parentElement.cells[1].innerText.trim();
    const faculty = parent.parentElement.cells[2].innerText.trim();
    return courseName + " : " + curCat + "," + slots.join('+') + "," + venue + "," + faculty;
}

function shouldDisableCheckbox(checkbox) {
    const slots = checkbox.parentElement.innerText.trim().split("+");
    for (let i = 0; i < slots.length; i++) {
        const slot = slots[i];
        if (selections[slot]) {
            return true;
        }
        const conflictsArray = slotConflicts[slot];
        if (conflictsArray) {
            for (let j = 0; j < conflictsArray.length; j++) {
                const cSlot = conflictsArray[j];
                if (selections[cSlot]) {
                    return true;
                }
            }
        }
    }
    return false;
}

function updateCurrentPageCheckboxes(courseSelected) {
    const checkboxes = document.querySelectorAll('table > tbody > tr > td > input.courseToggle');
    checkboxes.forEach(checkbox => {
        if (courseList[getCourseId(checkbox)]) {
            return;
        }
        if (courseSelected) {
            checkbox.disabled = true;
        } else {
            checkbox.disabled = shouldDisableCheckbox(checkbox);
        }
    });
}

function courseToggle(checkbox) {
    const course = getCourseId(checkbox);
    const slots = checkbox.parentElement.innerText.trim().split("+");
    if (checkbox.checked) {
        for (let i = 0; i < slots.length; i++) {
            const slot = slots[i];
            selections[slot] = course;
            const conflictsArray = slotConflicts[slot];
            if (conflictsArray) {
                for (let j = 0; j < conflictsArray.length; j++) {
                    const cSlot = conflictsArray[j];
                    selections[cSlot] = course;
                }
            }
            courseList[course] = {};
        }
    } else {
        slots.forEach(slot => {
            delete selections[slot];
            const conflictsArray = slotConflicts[slot];
            if (conflictsArray) {
                conflictsArray.forEach(cSlot => {
                    delete selections[cSlot];
                });
            }
            delete courseList[course];
        });
    }
    updateCurrentPageCheckboxes(checkbox.checked);
    console.log("selections", selections);
    console.log("courseList", courseList);
}

function showSelections() {
    if (document.getElementById("RegistrationSchedule") == null) {
        alert("Not in Course Registration Allocation page");
        return;
    }
    if (document.getElementById("courseId") == null) {
        alert("No course details");
        return;
    }
    if (document.getElementById("courseId").value == "") {
        alert("Please select the course list");
        return;
    }
    if (document.getElementsByClassName("courseToggle").length > 0) {
        return;
    }
    const rows = document.querySelectorAll('table > tbody > tr');
    let courseSelected = false;
    for (let r = 0; r < rows.length; r++) {
        const cols = rows[r].cells;
        const e = document.createElement('input');
        e.type = 'checkbox';
        e.classList.add('courseToggle');
        e.onclick = function() { courseToggle(this); };
        cols[0].insertAdjacentElement('afterbegin', e);
        if (courseList[getCourseId(e)]) {
            e.checked = true;
            courseSelected = true;
        } else {
            e.disabled = shouldDisableCheckbox(e);
        }
    }
    updateCurrentPageCheckboxes(courseSelected);
}

function showTimetable() {
    console.log("timetable", Object.keys(courseList));
    let tt = "Timetable:\n\n";
    Object.keys(courseList).forEach(course => {
        tt += course + "\n";
    });
    alert(tt);
}

function clearTimetable() {
    selections = {};
    courseList = {};
    document.querySelectorAll('.courseToggle').forEach(e => e.checked = false);
}

function saveTimetable() {
    const tt = JSON.stringify(Object.keys(courseList), null, 2);
    const link = document.createElement('a');
    const url = URL.createObjectURL(new Blob([tt], { type: 'application/json; charset=utf-8;' }));
    link.setAttribute('href', url);
    link.setAttribute('download', 'tt.json');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

console.log("content script injected");
clearTimetable();

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.text === 'ping') {
      sendResponse({status: "pong"});
    }
});
