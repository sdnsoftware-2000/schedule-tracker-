const DEFAULT_ACTIVITIES = [
    {
        id: "software-morning",
        name: "Software",
        start: "04:55",
        end: "06:25",
        icon: "💻",
        repeat: "daily"
    },
    {
        id: "exercise",
        name: "Morning Exercise",
        start: "06:25",
        end: "06:40",
        icon: "🏃",
        repeat: "daily"
    },
    {
        id: "swimming",
        name: "Swimming",
        start: "06:40",
        end: "07:20",
        icon: "🏊",
        repeat: "daily"
    },
    {
        id: "morning-routine",
        name: "Morning Routine",
        start: "07:20",
        end: "07:55",
        icon: "🛁",
        repeat: "daily"
    },
    {
        id: "newspaper",
        name: "Newspaper",
        start: "08:00",
        end: "09:00",
        icon: "📰",
        repeat: "daily"
    },
    {
        id: "metro-morning",
        name: "Metro / Commute",
        start: "09:00",
        end: "09:30",
        icon: "🚇",
        repeat: "daily"
    },
    {
        id: "college",
        name: "College",
        start: "09:30",
        end: "17:45",
        icon: "🎓",
        repeat: "daily"
    },
    {
        id: "upsc",
        name: "UPSC / GPSC",
        start: "17:45",
        end: "19:05",
        icon: "📚",
        repeat: "daily"
    },
    {
        id: "language",
        name: "New Language",
        start: "19:05",
        end: "20:00",
        icon: "🗣️",
        repeat: "daily"
    },
    {
        id: "dinner",
        name: "Dinner",
        start: "20:15",
        end: "20:35",
        icon: "🍽️",
        repeat: "daily"
    },
    {
        id: "software-evening",
        name: "Software",
        start: "20:35",
        end: "22:05",
        icon: "💻",
        repeat: "daily"
    },
    {
        id: "subject",
        name: "College Subject Preparation",
        start: "22:05",
        end: "22:45",
        icon: "📖",
        repeat: "daily"
    },
    {
        id: "assignment",
        name: "Lab Manual / Assignment",
        start: "22:45",
        end: "23:10",
        icon: "✏️",
        repeat: "daily"
    },
    {
        id: "tomorrow",
        name: "Prepare Tomorrow",
        start: "23:10",
        end: "23:25",
        icon: "🎯",
        repeat: "daily"
    },
    {
        id: "sleep",
        name: "Sleep",
        start: "23:30",
        end: "",
        icon: "🛏️",
        repeat: "daily"
    }
];

const ICONS = [
    "💻", "📚", "🎓", "📝", "📖", "✏️",
    "🏃", "🏊", "🧘", "📰", "🚇", "🚌",
    "🍽️", "🗣️", "🎯", "💡", "🎨", "🎵",
    "🛏️", "☕", "🌱", "⚡"
];

const STORAGE_ACTIVITIES = "myday_v2_activities";
const STORAGE_COMPLETIONS = "myday_v2_completions";

let activities = [];
let completions = {};
let selectedDate = new Date();
let calendarDate = new Date();
let selectedIcon = "📚";

const $ = id => document.getElementById(id);

function cloneDefaults() {
    return DEFAULT_ACTIVITIES.map(activity => ({ ...activity }));
}

function dateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function timeToMinutes(time) {
    if (!time) {
        return 0;
    }

    const [hours, minutes] = time.split(":").map(Number);

    return hours * 60 + minutes;
}

function getDuration(activity) {
    if (!activity.end) {
        return 0;
    }

    const start = timeToMinutes(activity.start);
    const end = timeToMinutes(activity.end);

    return end >= start ? end - start : 1440 - start + end;
}

function formatDuration(minutes) {
    if (minutes <= 0) {
        return "0m";
    }

    if (minutes < 60) {
        return `${minutes}m`;
    }

    const hours = Math.floor(minutes / 60);
    const remaining = minutes % 60;

    return remaining > 0
        ? `${hours}h ${remaining}m`
        : `${hours}h`;
}

function formatDate(date) {
    return date.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long"
    });
}

function sameDay(first, second) {
    return dateKey(first) === dateKey(second);
}

function activityApplies(activity, date) {
    if (activity.repeat === "weekdays") {
        const day = date.getDay();
        return day >= 1 && day <= 5;
    }

    if (activity.repeat === "weekends") {
        const day = date.getDay();
        return day === 0 || day === 6;
    }

    return true;
}

/* Storage */

function saveActivities() {
    localStorage.setItem(
        STORAGE_ACTIVITIES,
        JSON.stringify(activities)
    );
}

function saveCompletions() {
    localStorage.setItem(
        STORAGE_COMPLETIONS,
        JSON.stringify(completions)
    );
}

function saveAll() {
    saveActivities();
    saveCompletions();
}

function loadData() {
    const savedActivities = localStorage.getItem(STORAGE_ACTIVITIES);
    const savedCompletions = localStorage.getItem(STORAGE_COMPLETIONS);

    if (savedActivities) {
        try {
            const parsed = JSON.parse(savedActivities);

            if (Array.isArray(parsed) && parsed.length > 0) {
                activities = parsed;
            } else {
                activities = cloneDefaults();
                saveActivities();
            }
        } catch {
            activities = cloneDefaults();
            saveActivities();
        }
    } else {
        activities = cloneDefaults();
        saveActivities();
    }

    if (savedCompletions) {
        try {
            const parsed = JSON.parse(savedCompletions);

            completions =
                parsed && typeof parsed === "object"
                    ? parsed
                    : {};
        } catch {
            completions = {};
            saveCompletions();
        }
    }
}

/* Activities */

function getActivitiesForDate(date) {
    return activities
        .filter(activity => activityApplies(activity, date))
        .sort((a, b) => {
            return timeToMinutes(a.start) - timeToMinutes(b.start);
        });
}

function isCompleted(activity, date = selectedDate) {
    const key = dateKey(date);

    return Array.isArray(completions[key]) &&
        completions[key].includes(activity.id);
}

function toggleActivity(id) {
    const key = dateKey(selectedDate);

    if (!Array.isArray(completions[key])) {
        completions[key] = [];
    }

    const index = completions[key].indexOf(id);

    if (index === -1) {
        completions[key].push(id);
    } else {
        completions[key].splice(index, 1);
    }

    saveCompletions();
    render();
}

function getCurrentActivity(list) {
    const now = new Date();

    if (!sameDay(selectedDate, now)) {
        return null;
    }

    const currentMinutes =
        now.getHours() * 60 + now.getMinutes();

    return list.find(activity => {
        if (!activity.end) {
            return false;
        }

        const start = timeToMinutes(activity.start);
        const end = timeToMinutes(activity.end);

        return currentMinutes >= start && currentMinutes < end;
    });
}

/* Main Render */

function render() {
    renderHeader();
    renderSchedule();
    renderSummary();
    renderCalendar();
    renderLastCheck();
    renderIconPicker();
}

/* Header */

function renderHeader() {
    const list = getActivitiesForDate(selectedDate);
    const completedCount = list.filter(activity =>
        isCompleted(activity)
    ).length;

    const totalCount = list.length;
    const percent = totalCount
        ? Math.round((completedCount / totalCount) * 100)
        : 0;

    const today = new Date();

    $("selectedDateText").textContent =
        sameDay(selectedDate, today)
            ? "Today"
            : formatDate(selectedDate);

    $("dateInfo").textContent =
        selectedDate.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });

    $("completedCount").textContent = completedCount;
    $("totalCount").textContent = totalCount;

    $("progressPercent").textContent = `${percent}%`;
    $("summaryPercent").textContent = `${percent}%`;

    $("summaryDone").textContent = completedCount;
    $("summaryRemaining").textContent =
        Math.max(0, totalCount - completedCount);

    $("scoreBar").style.width = `${percent}%`;

    const circumference = 314;

    $("ringFill").style.strokeDashoffset =
        circumference - circumference * percent / 100;

    updateHeroMessage(percent);
    $("streakCount").textContent = getStreak();
}

function updateHeroMessage(percent) {
    const hour = new Date().getHours();

    if (percent === 100) {
        $("greeting").textContent = "You did it. 🎉";
        $("motivation").textContent =
            "Everything checked off. That's a day well spent.";
        $("progressLabel").textContent = "Day complete!";
        $("progressSub").textContent = "You crushed today's plan.";
        return;
    }

    if (!sameDay(selectedDate, new Date())) {
        $("greeting").textContent = "Your planned day.";
        $("motivation").textContent =
            "A clear plan makes a better day.";
        $("progressLabel").textContent = "Schedule ready";
        $("progressSub").textContent =
            `${percent}% of this day's tasks complete.`;
        return;
    }

    if (percent >= 80) {
        $("greeting").textContent = "Almost unstoppable.";
        $("motivation").textContent =
            "You're very close. Finish the last few.";
        $("progressLabel").textContent = "You're almost there!";
        $("progressSub").textContent =
            "Keep the momentum going.";
        return;
    }

    if (percent >= 50) {
        $("greeting").textContent = "You're in the zone.";
        $("motivation").textContent =
            "Halfway there. Don't break the rhythm.";
        $("progressLabel").textContent = "Great momentum!";
        $("progressSub").textContent =
            "Keep moving forward.";
        return;
    }

    if (percent > 0) {
        $("greeting").textContent =
            hour < 12 ? "Start strong." : "Keep going.";

        $("motivation").textContent =
            "One completed task at a time.";

        $("progressLabel").textContent = "You're moving!";
        $("progressSub").textContent =
            "Every checkmark counts.";
        return;
    }

    $("greeting").textContent =
        hour < 12 ? "Make today count." : "Finish the day strong.";

    $("motivation").textContent =
        "Your schedule is ready. Make the first move.";

    $("progressLabel").textContent = "Let's get started";
    $("progressSub").textContent = "Your day is waiting.";
}

/* Schedule */

function renderSchedule() {
    const list = getActivitiesForDate(selectedDate);
    const current = getCurrentActivity(list);

    if (list.length === 0) {
        $("schedule").innerHTML = `
            <div class="side-card empty-state">
                <strong>No activities yet.</strong>
                <p>Add your first activity below.</p>
            </div>
        `;
        return;
    }

    $("schedule").innerHTML = "";

    list.forEach(activity => {
        const isDone = isCompleted(activity);
        const isCurrent =
            current &&
            current.id === activity.id &&
            !isDone;

        const item = document.createElement("div");

        item.className =
            `activity${isDone ? " done" : ""}${isCurrent ? " active" : ""}`;

        const time = document.createElement("div");
        time.className = "activity-time";
        time.textContent =
            activity.start +
            (activity.end ? `–${activity.end}` : "");

        const body = document.createElement("div");
        body.className = "activity-body";

        const icon = document.createElement("div");
        icon.className = "activity-icon";
        icon.textContent = activity.icon;

        const content = document.createElement("div");

        const name = document.createElement("div");
        name.className = "activity-name";
        name.textContent = activity.name;

        const duration = document.createElement("div");
        duration.className = "activity-duration";
        duration.textContent =
            getDuration(activity) > 0
                ? formatDuration(getDuration(activity))
                : "Open-ended";

        content.appendChild(name);
        content.appendChild(duration);

        body.appendChild(icon);
        body.appendChild(content);

        const menu = document.createElement("div");
        menu.className = "activity-menu";

        const check = document.createElement("button");
        check.type = "button";
        check.className = "check";
        check.textContent = "✓";

        check.addEventListener("click", () => {
            toggleActivity(activity.id);
        });

        const more = document.createElement("button");
        more.type = "button";
        more.className = "more-btn";
        more.textContent = "•••";

        more.addEventListener("click", () => {
            openEditModal(activity.id);
        });

        menu.appendChild(check);
        menu.appendChild(more);

        item.appendChild(time);
        item.appendChild(body);
        item.appendChild(menu);

        $("schedule").appendChild(item);
    });
}

/* Summary */

function renderSummary() {
    const list = getActivitiesForDate(selectedDate);

    const softwareMinutes = list
        .filter(activity =>
            activity.name.toLowerCase().includes("software")
        )
        .reduce((sum, activity) => {
            return sum + getDuration(activity);
        }, 0);

    const studyMinutes = list
        .filter(activity =>
            /upsc|gpsc|subject|assignment|manual|language|newspaper/i
                .test(activity.name)
        )
        .reduce((sum, activity) => {
            return sum + getDuration(activity);
        }, 0);

    const exerciseMinutes = list
        .filter(activity =>
            /exercise|swimming/i.test(activity.name)
        )
        .reduce((sum, activity) => {
            return sum + getDuration(activity);
        }, 0);

    const totalMinutes = list.reduce((sum, activity) => {
        return sum + getDuration(activity);
    }, 0);

    $("softwareTime").textContent =
        formatDuration(softwareMinutes);

    $("studyTime").textContent =
        formatDuration(studyMinutes);

    $("exerciseTime").textContent =
        formatDuration(exerciseMinutes);

    $("summaryMinutes").textContent =
        formatDuration(totalMinutes);

    const completedCount = list.filter(activity =>
        isCompleted(activity)
    ).length;

    const progress = list.length
        ? completedCount / list.length
        : 0;

    document
        .querySelectorAll(".momentum-line span")
        .forEach((bar, index) => {
            bar.classList.toggle(
                "active",
                index < Math.ceil(progress * 5)
            );
        });

    if (progress === 1) {
        $("momentumTitle").textContent = "Perfect day. 🎉";
        $("momentumText").textContent =
            "Everything is complete.";
    } else if (progress >= 0.8) {
        $("momentumTitle").textContent = "Almost unstoppable.";
        $("momentumText").textContent =
            "Just a few more tasks.";
    } else if (progress >= 0.5) {
        $("momentumTitle").textContent = "You're in the zone.";
        $("momentumText").textContent =
            "Halfway there. Keep the rhythm going.";
    } else if (progress > 0) {
        $("momentumTitle").textContent = "Good start.";
        $("momentumText").textContent =
            "Keep stacking those small wins.";
    } else {
        $("momentumTitle").textContent =
            "Start your first win.";

        $("momentumText").textContent =
            "Complete one task and build your momentum.";
    }
}

/* Streak */

function getDayPercent(date) {
    const list = getActivitiesForDate(date);

    if (list.length === 0) {
        return 0;
    }

    const done = list.filter(activity =>
        isCompleted(activity, date)
    ).length;

    return Math.round((done / list.length) * 100);
}

function getStreak() {
    let date = new Date();
    let streak = 0;

    while (true) {
        const percent = getDayPercent(date);

        if (percent < 80) {
            break;
        }

        streak++;

        date.setDate(date.getDate() - 1);

        if (streak >= 365) {
            break;
        }
    }

    return streak;
}

/* Calendar */

function renderCalendar() {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();

    $("calendarMonth").textContent =
        calendarDate.toLocaleDateString("en-IN", {
            month: "long",
            year: "numeric"
        });

    const firstDay =
        new Date(year, month, 1).getDay();

    const daysInMonth =
        new Date(year, month + 1, 0).getDate();

    $("calendarGrid").innerHTML = "";

    const dayNames = [
        "Sun",
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat"
    ];

    dayNames.forEach(day => {
        const element = document.createElement("div");

        element.className = "calendar-day-name";
        element.textContent = day;

        $("calendarGrid").appendChild(element);
    });

    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement("div");

        empty.className = "calendar-day empty";

        $("calendarGrid").appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const percent = getDayPercent(date);

        const element = document.createElement("div");

        element.className = "calendar-day";

        if (sameDay(date, new Date())) {
            element.classList.add("today");
        }

        if (sameDay(date, selectedDate)) {
            element.classList.add("selected");
        }

        const number = document.createElement("strong");
        number.textContent = day;

        const percentage = document.createElement("small");
        percentage.textContent = `${percent}% done`;

        const progress = document.createElement("div");
        progress.className = "calendar-progress";

        const progressFill = document.createElement("span");
        progressFill.style.width = `${percent}%`;

        progress.appendChild(progressFill);

        element.appendChild(number);
        element.appendChild(percentage);
        element.appendChild(progress);

        element.addEventListener("click", () => {
            selectedDate = date;
            render();
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });

        $("calendarGrid").appendChild(element);
    }
}

/* Last Check */

function renderLastCheck() {
    const now = new Date();

    if (
        !sameDay(selectedDate, now) ||
        now.getHours() < 22 ||
        (now.getHours() === 22 && now.getMinutes() < 45)
    ) {
        $("lastCheck").classList.remove("show");
        return;
    }

    const incomplete = getActivitiesForDate(now).filter(activity => {
        return (
            !isCompleted(activity, now) &&
            activity.name !== "Sleep"
        );
    });

    $("lastCheck").classList.add("show");
    $("lastCheckTasks").innerHTML = "";

    if (incomplete.length === 0) {
        $("lastCheckText").textContent =
            "All important tasks are complete. Finish calmly.";

        const complete = document.createElement("div");
        complete.className = "last-task";
        complete.textContent = "✓ Day complete";

        $("lastCheckTasks").appendChild(complete);
        return;
    }

    $("lastCheckText").textContent =
        `${incomplete.length} task${incomplete.length > 1 ? "s" : ""} still need attention.`;

    incomplete.forEach(activity => {
        const task = document.createElement("div");

        task.className = "last-task";
        task.textContent =
            `${activity.icon} ${activity.name}`;

        $("lastCheckTasks").appendChild(task);
    });
}

/* Modal */

function openModal(id) {
    $(id).classList.add("show");
}

function closeModal(id) {
    $(id).classList.remove("show");
}

function openAddModal() {
    $("modalTitle").textContent = "Add Activity";

    $("activityForm").reset();

    $("activityId").value = "";
    $("activityRepeat").value = "daily";

    selectedIcon = "📚";

    $("deleteActivityBtn").classList.add("hidden");

    renderIconPicker();
    openModal("activityModal");
}

function openEditModal(id) {
    const activity =
        activities.find(item => item.id === id);

    if (!activity) {
        return;
    }

    $("modalTitle").textContent = "Edit Activity";

    $("activityId").value = activity.id;
    $("activityName").value = activity.name;
    $("activityStart").value = activity.start;
    $("activityEnd").value = activity.end;
    $("activityRepeat").value = activity.repeat;

    selectedIcon = activity.icon;

    $("deleteActivityBtn").classList.remove("hidden");

    renderIconPicker();
    openModal("activityModal");
}

function saveActivity(event) {
    event.preventDefault();

    const name =
        $("activityName").value.trim();

    const start =
        $("activityStart").value;

    const end =
        $("activityEnd").value;

    if (!name || !start) {
        return;
    }

    const id =
        $("activityId").value ||
        `activity-${Date.now()}`;

    const activity = {
        id,
        name,
        start,
        end,
        icon: selectedIcon,
        repeat: $("activityRepeat").value
    };

    const existingIndex =
        activities.findIndex(item => item.id === id);

    if (existingIndex === -1) {
        activities.push(activity);
    } else {
        activities[existingIndex] = activity;
    }

    saveActivities();

    closeModal("activityModal");

    render();
}

function deleteActivity() {
    const id = $("activityId").value;

    if (!id) {
        return;
    }

    const confirmed =
        confirm("Delete this activity?");

    if (!confirmed) {
        return;
    }

    activities =
        activities.filter(activity => activity.id !== id);

    Object.keys(completions).forEach(key => {
        completions[key] =
            completions[key].filter(
                activityId => activityId !== id
            );
    });

    saveAll();

    closeModal("activityModal");

    render();
}

function resetSchedule() {
    const confirmed =
        confirm(
            "Reset your schedule to the original MyDay plan?"
        );

    if (!confirmed) {
        return;
    }

    activities = cloneDefaults();
    completions = {};

    saveAll();

    closeModal("settingsModal");

    selectedDate = new Date();
    calendarDate = new Date();

    render();
}

/* Icons */

function renderIconPicker() {
    $("iconPicker").innerHTML = "";

    ICONS.forEach(icon => {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "icon-option";

        if (icon === selectedIcon) {
            button.classList.add("selected");
        }

        button.textContent = icon;

        button.addEventListener("click", () => {
            selectedIcon = icon;
            renderIconPicker();
        });

        $("iconPicker").appendChild(button);
    });
}

/* Events */

$("addActivityBtn").addEventListener(
    "click",
    openAddModal
);

$("addTopBtn").addEventListener(
    "click",
    openAddModal
);

$("settingsBtn").addEventListener(
    "click",
    () => openModal("settingsModal")
);

$("calendarBtn").addEventListener(
    "click",
    () => {
        $("calendarSection").classList.toggle("show");

        $("calendarSection").scrollIntoView({
            behavior: "smooth"
        });
    }
);

$("todayBtn").addEventListener(
    "click",
    () => {
        selectedDate = new Date();
        calendarDate = new Date();

        render();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
);

$("prevMonth").addEventListener(
    "click",
    () => {
        calendarDate.setMonth(
            calendarDate.getMonth() - 1
        );

        renderCalendar();
    }
);

$("nextMonth").addEventListener(
    "click",
    () => {
        calendarDate.setMonth(
            calendarDate.getMonth() + 1
        );

        renderCalendar();
    }
);

$("activityForm").addEventListener(
    "submit",
    saveActivity
);

$("deleteActivityBtn").addEventListener(
    "click",
    deleteActivity
);

$("resetBtn").addEventListener(
    "click",
    resetSchedule
);

document.querySelectorAll("[data-close]").forEach(button => {
    button.addEventListener("click", () => {
        closeModal(button.dataset.close);
    });
});

document.querySelectorAll(".modal-overlay").forEach(modal => {
    modal.addEventListener("click", event => {
        if (event.target === modal) {
            closeModal(modal.id);
        }
    });
});

document.addEventListener("keydown", event => {
    if (event.key !== "Escape") {
        return;
    }

    document
        .querySelectorAll(".modal-overlay.show")
        .forEach(modal => {
            closeModal(modal.id);
        });
});

/* Start */

loadData();
render();

setInterval(render, 60000);
