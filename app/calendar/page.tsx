"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  formatDate,
  DateSelectArg,
  EventClickArg,
} from "@fullcalendar/core";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import Wrapper from "@/components/Wrapper";

interface Event {
  id: number;
  description: string;
  date: Date;
}

const Calendar: React.FC = () => {
  const [currentEvents, setCurrentEvents] = useState<Event[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [newEventDescription, setNewEventDescription] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<DateSelectArg | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const calendarRef = useRef<FullCalendar>(null);

  useEffect(() => {
    fetchEvents();
    checkMobile();
    window.addEventListener('resize', checkMobile);
    window.addEventListener('resize', handleWindowResize);
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  const checkMobile = () => {
    setIsMobile(window.innerWidth < 768);
  };

  const handleWindowResize = () => {
    if (calendarRef.current) {
      calendarRef.current.getApi().updateSize();
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      const data = await response.json();
      setCurrentEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleDateClick = (selected: DateSelectArg) => {
    setSelectedDate(selected);
    setIsDialogOpen(true);
  };

  const handleEventClick = async (selected: EventClickArg) => {
    if (window.confirm(`Delete event "${selected.event.title}"?`)) {
      try {
        await fetch('/api/events', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: selected.event.id }),
        });
        await fetchEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  const handleEventUpdate = async (eventId: number, newDate: Date) => {
    try {
      await fetch('/api/events', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: eventId,
          date: newDate,
        }),
      });
      await fetchEvents();
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const handleEventDrop = async (info: any) => {
    setIsDragging(true);
    try {
      await handleEventUpdate(
        Number(info.event.id),
        info.event.start
      );
    } finally {
      setIsDragging(false);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setNewEventDescription("");
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newEventDescription && selectedDate) {
      try {
        await fetch('/api/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            description: newEventDescription,
            date: selectedDate.start,
          }),
        });
        
        await fetchEvents();
        handleCloseDialog();
      } catch (error) {
        console.error('Error creating event:', error);
      }
    }
  };

  return (
    <Wrapper>
      <div className="flex flex-col md:flex-row w-full justify-start items-start gap-4 md:gap-8">
        {/* Left Sidebar - Events List */}
        <div className="w-full md:w-3/12">
          <div className="py-6 md:py-10 text-xl md:text-2xl font-extrabold px-4 md:px-7">
            Calendar Events
          </div>
          <ul className="space-y-2 max-h-[200px] md:max-h-none overflow-y-auto px-2">
            {currentEvents.length <= 0 && (
              <div className="italic text-center text-gray-400">
                No Events Present
              </div>
            )}

            {currentEvents.map((event) => (
              <li
                className="flex flex-col border border-base-200 shadow-md px-3 py-1 md:px-4 md:py-2 rounded-md bg-base-100 text-sm md:text-base"
                key={event.id}
              >
                <strong className="text-primary">{event.description}</strong>
                <span className="text-xs text-base-content opacity-75">
                  {formatDate(event.date, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Calendar */}
        <div className="w-full md:w-9/12 px-2 md:px-0">
          <div className="h-[60vh] md:h-[81vh]">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: isMobile ? "dayGridMonth,listWeek" : "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
              }}
              initialView={isMobile ? "listWeek" : "dayGridMonth"}
              height="100%"
              editable={true}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={true}
              select={handleDateClick}
              eventClick={handleEventClick}
              eventDrop={handleEventDrop}
              eventDragStart={() => setIsDragging(true)}
              eventDragStop={() => setIsDragging(false)}
              events={currentEvents.map(event => ({
                id: event.id.toString(),
                start: event.date,
                description: event.description,
                className: isDragging ? 'opacity-50' : ''
              }))}
            />
          </div>
        </div>
      </div>

      {/* DaisyUI Modal */}
      <dialog className={`modal ${isDialogOpen ? 'modal-open' : ''}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">Add New Event</h3>
          <form className="space-y-4 mt-4" onSubmit={handleAddEvent}>
            <textarea
              placeholder="Event Description"
              value={newEventDescription}
              onChange={(e) => setNewEventDescription(e.target.value)}
              className="textarea textarea-bordered w-full"
              rows={3}
            />
            <div className="modal-action flex flex-col md:flex-row gap-2">
              <button
                type="button"
                className="btn btn-ghost md:flex-1"
                onClick={handleCloseDialog}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary md:flex-1">
                Add Event
              </button>
            </div>
          </form>
        </div>
        
        {/* Click outside to close */}
        <form method="dialog" className="modal-backdrop">
          <button onClick={handleCloseDialog}>close</button>
        </form>
      </dialog>
    </Wrapper>
  );
};

export default Calendar;