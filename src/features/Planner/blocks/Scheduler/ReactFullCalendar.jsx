import React from "react";
import ReactDOM from "react-dom";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverHeader,
    PopoverBody,
    PopoverFooter,
    PopoverArrow,
    PopoverCloseButton
} from "@chakra-ui/react";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import resourceTimeGridPlugin from "@fullcalendar/resource-timegrid";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button
} from "@chakra-ui/react";
import "@fullcalendar/core/main.css";
import "@fullcalendar/daygrid/main.css";

import "@fullcalendar/core/main.css";
import "@fullcalendar/daygrid/main.css";

class App extends React.Component {
    calendarComponentRef = React.createRef();
    state = {
        modal: false,
        calendarWeekends: true,
        events: [
            { id: 1, title: "event 1", date: "2019-12-01" },
            {
                title: "event 2",
                start: "2021-06-17",
                end: "2019-12-05",
                allDay: true,
                HostName: "William"
            },
            {
                title: "event 3",
                start: "2019-12-05",
                end: "2019-12-07",
                allDay: true
            },
            {
                title: "event 4",
                start: "2019-12-05",
                end: "2019-12-07",
                allDay: true
            },
            {
                title: "event 5",
                start: "2019-12-05",
                end: "2019-12-07",
                allDay: true
            },
            {
                title: "event 6",
                start: "2019-12-05",
                end: "2019-12-07",
                allDay: true
            }
        ]
    };

    handleDateClick = ( arg ) => {
        alert( arg.dateStr );
    };

    handleSelectedDates = ( info ) => {
        alert( "selected " + info.startStr + " to " + info.endStr );
        const title = prompt( "What's the name of the title" );
        console.log( info );
        if ( title != null ) {
            const newEvent = {
                title,
                start: info.startStr,
                end: info.endStr
            };
            const data = [ ...this.state.events, newEvent ];
            this.setState( { events: data } );
            console.log( "here", data );
        } else {
            console.log( "nothing" );
        }
    };

    toggle = () => {
        this.setState( { modal: !this.state.modal } );
    };

    handleEventClick = ( { event, el } ) => {
        this.toggle();
        this.setState( { event } );
    };

    render () {
        return (
            <div>
                <FullCalendar
                    schedulerLicenseKey="GPL-My-Project-Is-Open-Source"
                    ref={ this.calendarComponentRef }
                    defaultView="dayGridMonth"
                    dateClick={ this.handleDateClick }
                    displayEventTime={ true }
                    header={ {
                        left: "prev,next today",
                        center: "title",
                        right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek"
                    } }
                    selectable={ true }
                    plugins={ [
                        dayGridPlugin,
                        interactionPlugin,
                        timeGridPlugin,
                        resourceTimeGridPlugin
                    ] }
                    events={ this.state.events }
                    select={ this.handleSelectedDates }
                    eventClick={ this.handleEventClick }
                    eventLimit={ 3 }
                />
                <Modal isOpen={ this.state.modal } toggle={ this.toggle }>
                    <ModalHeader toggle={ this.toggle }>
                        EVENT TITLE SHOULD GO HERE:
                    </ModalHeader>
                    <ModalBody>
                        <div>EVENT INFO SHOULD GO HERE: </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary">Do Something</Button>{ " " }
                        <Button color="secondary" onClick={ this.toggle }>
                            Cancel
                        </Button>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}

const rootElement = document.getElementById( "root" );
ReactDOM.render( <App />, rootElement );
