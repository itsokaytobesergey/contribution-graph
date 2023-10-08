import {
  addMonths,
  differenceInDays,
  endOfWeek,
  format,
  getWeeksInMonth,
  lastDayOfMonth,
  startOfWeek,
  subDays,
  subWeeks,
} from 'date-fns';
import { ru } from 'date-fns/locale';

const squares = document.querySelector('.squares');
const months = document.querySelector('.months');
const currentDate = new Date();
const squareSize = Number(getComputedStyle(document.body)
  .getPropertyValue('--square-size')
  .replace('px', ''));
const squareGap = Number(getComputedStyle(document.body)
  .getPropertyValue('--square-gap')
  .replace('px', ''));

const MONTHS = {
  january: 'Янв.',
  february: 'Февр.',
  march: 'Март',
  april: 'Апр',
  may: 'Май',
  june: 'Июнь',
  july: 'Июль',
  august: 'Авг.',
  september: 'Сент.',
  october: 'Окт.',
  november: 'Нояб.',
  december: 'Дек.',
}

function createGraphWeek(day, calendar) {
  const lastDayOfWeek = endOfWeek(day, { weekStartsOn: 1 });
  
  for (let i = 6; i >= 0; i--) {
    const day = subDays(lastDayOfWeek, i);
    const formattedDate = format(day, 'yyyy-MM-dd');
    const dayContributions = calendar[formattedDate];

    const htmlElement = document.createElement('li');
    if (dayContributions) {
      htmlElement.dataset.contribution = dayContributions;

      if (0 <= dayContributions && dayContributions <= 9) {
        htmlElement.dataset.level = 1;
      } else if (10 <= dayContributions && dayContributions <= 19) {
        htmlElement.dataset.level = 2;
      } else if (20 <= dayContributions && dayContributions <= 29) {
        htmlElement.dataset.level = 3;
      } else {
        htmlElement.dataset.level = 4;
      }
    } else {
      htmlElement.dataset.contribution = 0;
    }
    htmlElement.dataset.date = formattedDate;
    squares.append(htmlElement);
  }
}

function createFullGraphWeeks(calendar) {
  for (let week = 1; week <= 51; week++) {
    if (week === 51) {
      createGraphWeek(currentDate, calendar);
    } else {
      const day = subWeeks(currentDate, 51 - week);
      createGraphWeek(day, calendar);
    }
  }
}

function createMonthLegend(monthName, weeksLeft) {
  const htmlElement = document.createElement('li');
  htmlElement.classList.add(monthName);
  htmlElement.innerHTML = MONTHS[monthName];
  htmlElement.style.width = `${(squareGap + squareSize) * (weeksLeft === 1 ? weeksLeft + 1 : weeksLeft)}px`;
  months.append(htmlElement);
}

function createFullMonthsLegend () {
  const currentDate50WeeksAgo = subWeeks(currentDate, 50);

  for (let month = 0; month <= 12; month++) {
    const iterableMonth = addMonths(currentDate50WeeksAgo, month);
    const monthName = format(iterableMonth, 'MMMM').toLowerCase();

    if (month === 0) {
      const firstDayOfFirstWeek = startOfWeek(currentDate50WeeksAgo);
      const lastDayOfFirstMonth = lastDayOfMonth(firstDayOfFirstWeek);
      const diff = differenceInDays(lastDayOfFirstMonth, firstDayOfFirstWeek);
      const weeksLeft = Math.round(diff / 7);

      createMonthLegend(monthName, weeksLeft);
    } else if (month === 12) {
      const lastDayOfLastMonth = lastDayOfMonth(currentDate);
      const diff = differenceInDays(lastDayOfLastMonth, currentDate);
      const weeksLeft = Math.round(diff / 7);

      createMonthLegend(monthName, weeksLeft);
    } else {
      const weeksLeft = getWeeksInMonth(iterableMonth, { weekStartsOn: 1 }) - 1;

      createMonthLegend(monthName, weeksLeft);
    }
  }
}

function createPopovers() {
  const popups = document.querySelectorAll('.squares li');
  function showPopover(e) {
    const target = e.target;
    const targetPos = target.getBoundingClientRect();
    target.classList.add('selected');

    const contributionsNumber = target.dataset.contribution;
    const date = target.dataset.date;

    const popover = document.createElement('div');
    popover.classList.add('popover');
    const popoverContribution = document.createElement('p');
    popoverContribution.innerHTML = `${30 <= contributionsNumber ? '30+' : contributionsNumber}`
      + ` ${contributionsNumber === '1' ? 'contribution' : 'contributions'}`;
    popoverContribution.classList.add('contribution-number');
    popover.append(popoverContribution);
    if (date) {
      const popoverDate = document.createElement('span');
      popoverDate.innerHTML = `${format(new Date(date), 'EEEE, LLLL d, yyyy', { locale: ru })}`;
      popoverDate.classList.add('date');
      popover.append(popoverDate);
    }

    document.body.append(popover);
    const popoverPos = popover.getBoundingClientRect();
    const popoverLeftPos = targetPos.left + (targetPos.width / 2) - (popoverPos.width / 2);
    const popoverTopPos = targetPos.top - 8 - popoverPos.height;
    popover.style.left = `${popoverLeftPos}px`;
    popover.style.top = `${popoverTopPos}px`;

    const removePopoverHandler = (event) => {
      event.stopPropagation();
      delete popover.remove();
      document.removeEventListener('click', removePopoverHandler, true);
      document.querySelectorAll('.squares li')
        .forEach(el => el.classList.remove('selected'))
      if (event.target.closest('.squares li')) {
        showPopover(event);
      }
    }

    document.addEventListener('click', removePopoverHandler, true);
  }

  popups.forEach(el => {
    el.addEventListener('click', showPopover)
  })
}


fetch('https://dpg.gg/test/calendar.json')
  .then(r => r.json())
  .then(calendar => {
    createFullGraphWeeks(calendar);
    createFullMonthsLegend();
    createPopovers();
  })