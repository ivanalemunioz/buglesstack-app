interface Events {
	[ key: string ]: { [ id: string ]: (value: any) => void }
}

export default class EventEmitter {
	/**
	 * Events
	 **/
	private events: Events = {};

	/**
	 * Emit an event
	 *
	 * @param {string} event Event name
	 * @param {any} value emitted to the listeners
	 **/
	public emit (event: string, value: any) {
	    // Emit event if there are listeners
	    if (this.events[event]) {
	        for (const i in this.events[event]) {
	            this.events[event][i](value);
	        }
	    }
	}

	/**
	 * Add event listener
	 *
	 * @param {string} event Event name
	 * @param {function} handler Function execute
	 **/
	public on (event: string, handler: (value: any) => void) {
	    if (!this.events[event]) {
	        this.events[event] = {};
	    }

	    let id: string;

	    do {
	        id = String(Math.random() * 100000);
	    }
	    while (typeof this.events[event][id] !== 'undefined');

	    this.events[event][id] = handler;

	    return id;
	}

	/**
	 * Remove event listener
	 *
	 * @param {string} event Event name
	 * @param {string} id Id of the listener to remove
	 **/
	public removeListener (event: string, id: string) {
	    if (this.events[event] && this.events[event][id]) {
	        delete this.events[event][id];
	    }
	}
}
