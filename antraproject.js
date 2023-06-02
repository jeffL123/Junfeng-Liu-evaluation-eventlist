const API = (function() {
    const API_URL = "http://localhost:3000/events";
  
    const getEvents = async () => {
      const res = await fetch(API_URL);
      return await res.json();
    };
  
    const addEvent = async (newEvent) => {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newEvent)
      });
      return await res.json();
    };
  
    const deleteEvent = async (id) => {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
      });
      return await res.json();
    };
  
    const updateEvent = async (id, updatedEvent) => {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedEvent)
      });
      return await res.json();
    };
  
    return {
      getEvents,
      addEvent,
      deleteEvent,
      updateEvent
    };
  })();
  
  class EventModel {
    #events = [];
  
    async fetchEvents() {
      this.#events = await API.getEvents();
    }
  
    getEvents() {
      return this.#events;
    }
  
    async addEvent(newEvent) {
      const event = await API.addEvent(newEvent);
      this.#events.push(event);
      return event;
    }
  
    async deleteEvent(id) {
      await API.deleteEvent(id);
      this.#events = this.#events.filter((event) => event.id !== id);
    }
  
    async updateEvent(id, updatedEvent) {
      const event = await API.updateEvent(id, updatedEvent);
      const index = this.#events.findIndex((event) => event.id === id);
      if (index !== -1) {
        this.#events[index] = event;
      }
      return event;
    }
  }
  
  class EventView {
    constructor() {
      this.addEventBtn = document.getElementById("add-event-btn");
      this.eventList = document.getElementById("event-list");
      this.addEventForm = document.getElementById("add-event-form");
      this.nameInput = document.getElementById("event-name");
      this.startDateInput = document.getElementById("event-start-date");
      this.endDateInput = document.getElementById("event-end-date");
  
      this.addEventCallback = null;
      this.deleteEventCallback = null;
      this.updateEventCallback = null;
      
      this.bindEvents();
    }
  
    renderEventList(events) {
      this.eventList.innerHTML = "";
      events.forEach((event) => {
        const eventElem = this.createEventElem(event);
        this.eventList.appendChild(eventElem);
      });
    }
  
    createEventElem(event) {
      const eventElem = document.createElement("tr");
      eventElem.setAttribute("data-id", event.id);
      eventElem.innerHTML = `
        <td contenteditable>${event.name}</td>
        <td contenteditable>${event.startDate}</td>
        <td contenteditable>${event.endDate}</td>
        <td>
          <button class="edit-event-btn" data-id="${event.id}">
            <svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="EditIcon" aria-label="fontSize small">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path>
            </svg>
          </button>
          <button class="delete-event-btn" data-id="${event.id}" >
            <svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="DeleteIcon" aria-label="fontSize small">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path>
            </svg>
          </button>
        </td>
      `;
      return eventElem;
    }
  
    bindEvents() {
      this.addEventBtn.addEventListener("click", () => {
        this.handleAddEvent();
      });
  
      this.eventList.addEventListener("click", (e) => {
        const target = e.target;
        if (target.classList.contains("edit-event-btn")) {
          const eventId = target.getAttribute("data-id");
          this.updateEventCallback(eventId);
        } else if (target.classList.contains("delete-event-btn")) {
          const eventId = target.getAttribute("data-id");
          this.deleteEventCallback(eventId);
        }
      });
    }
  
    async handleAddEvent() {
      const newEvent = { name: "", startDate: "", endDate: "" };
      const event = await this.addEventCallback(newEvent);
      this.renderEventList(this.getEvents());
    }
  }
  
  class EventController {
    constructor(model, view) {
      this.model = model;
      this.view = view;
  
      this.view.addEventCallback = this.handleAddEvent.bind(this);
      this.view.deleteEventCallback = this.handleDeleteEvent.bind(this);
      this.view.updateEventCallback = this.handleUpdateEvent.bind(this);
  
      this.init();
    }
  
    async init() {
      await this.model.fetchEvents();
      this.view.renderEventList(this.model.getEvents());
    }
  
    async handleAddEvent(newEvent) {
      const event = await this.model.addEvent(newEvent);
      this.view.renderEventList(this.model.getEvents());
      return event;
    }
  
    async handleDeleteEvent(eventId) {
      await this.model.deleteEvent(eventId);
      this.view.renderEventList(this.model.getEvents());
    }
  
    async handleUpdateEvent(eventId) {
      const eventRow = document.querySelector(`tr[data-id="${eventId}"]`);
      const nameCell = eventRow.cells[0];
      const startDateCell = eventRow.cells[1];
      const endDateCell = eventRow.cells[2];
      if (nameCell.isContentEditable) {
        nameCell.contentEditable = false;
        startDateCell.contentEditable = false;
        endDateCell.contentEditable = false;
        nameCell.classList.remove("editable");
        startDateCell.classList.remove("editable");
        endDateCell.classList.remove("editable");
        this.model.updateEvent(eventId, {
          name: nameCell.textContent,
          startDate: startDateCell.textContent,
          endDate: endDateCell.textContent
        });
      } else {
        nameCell.contentEditable = true;
        startDateCell.contentEditable = true;
        endDateCell.contentEditable = true;
        nameCell.classList.add("editable");
        startDateCell.classList.add("editable");
        endDateCell.classList.add("editable");
      }
    }
  }
  
  const model = new EventModel();
  const view = new EventView();
  const controller = new EventController(model, view);