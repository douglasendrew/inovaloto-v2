document.addEventListener('DOMContentLoaded', function () {
  // Check and initialize main calendar
  var calendarEl = document.getElementById('calendar');
  if (calendarEl) {
    var calendar = new FullCalendar.Calendar(calendarEl, {
      headerToolbar: {
        left: 'prev next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
      },
      initialDate: '2024-05-12',
      navLinks: true, // can click day/week names to navigate views
      businessHours: true, // display business hours
      editable: true,
      selectable: true,
      events: [
        {
          title: 'Event 1',
          start: '2024-05-01'
        },
        {
          start: '2024-05-06',
          end: '2024-05-08',
          overlap: false,
          display: 'background',
          color: 'var(--clr-action-warning)'
        }
      ]
    });
    calendar.render();
  }

  // Check and initialize first mini calendar
  var calendarEl1 = document.getElementById('miniCalendar');
  if (calendarEl1) {
    var calendar1 = new FullCalendar.Calendar(calendarEl1, {
      headerToolbar: {
        left: 'prev next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      initialDate: '2024-05-12',
      navLinks: true, // can click day/week names to navigate views
      businessHours: true, // display business hours
      editable: true,
      selectable: true,
      events: []
    });
    calendar1.render();
  }

  // Check and initialize second mini calendar
  var calendarEl2 = document.getElementById('miniCalendar2');
  if (calendarEl2) {
    var calendar2 = new FullCalendar.Calendar(calendarEl2, {
      headerToolbar: {
        left: 'prev next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      initialDate: '2024-05-12',
      navLinks: true, // can click day/week names to navigate views
      businessHours: true, // display business hours
      editable: true,
      selectable: true,
      events: [
        {
          title: 'Conference',
          start: '2024-05-18',
          end: '2024-05-20'
        }
      ]
    });
    calendar2.render();
  }
});
