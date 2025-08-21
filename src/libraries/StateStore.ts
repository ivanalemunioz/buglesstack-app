import EventEmitter from '@/libraries/EventEmitter';

export default class StateStore extends EventEmitter {
    /**
     * State store
     **/
    private state: any = {};

    /**
     * Set state property
     *
     * @param {string} property State property name
     * @param {any} value Value to set
     **/
    public setStateProperty (property: string, value: any): void {
    	this.state[property] = value;

    	this.emit(property, value);
    }

    /**
     * Get state porperty value
     *
     * @param {string} property State property name
     **/
    public getStateProperty (property: string): any {
    	return this.state[property];
    }
}
