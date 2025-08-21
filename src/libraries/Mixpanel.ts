import mixpanel from 'mixpanel-browser';

export class MixpanelLibrary {
	initCallbacks: (()=> any)[] = [];

	initialized = false;
	initializing = false;

	async init () {		
	    return new Promise<void>(resolve => {
	        if (this.initialized) {
	            resolve();
	        }
			else if (this.initializing) {
	            this.initCallbacks.push(resolve);
	        }
			else {
	            this.initializing = true;

	            mixpanel.init(
	                process.env.MIXPANEL_TOKEN!, 
	                {
	                    debug: !(process.env.NODE_ENV === 'production'),
	                    persistence: 'localStorage',
	                    persistence_name: 'com.buglesstack.app:mixpanel',
	                    loaded: async () => {
	                        this.initialized = true;
	                        this.initializing = false;

	                        this.initCallbacks.map((cb: () => any) => cb());
	                        this.initCallbacks = [];

	                        resolve();
	                    }
		
	                }
	            ); 
	        }
	    });
	}

	/**
	 * Method to use to track an event
	 */
	async track (event: string, properties = {}) {
	    await this.init();
		
	    return mixpanel.track(event, properties);
	}

	/**
	 * Method to use to identify an user
	 */
	async identify (userId: string, data?: any) {
	    await this.init();

	    mixpanel.identify(userId);
		
	    if (data) {
	        mixpanel.people.set_once(data);
	    }
	}

	/**
	 * Method to use to reset the service
	 * 
	 * Usefull when user logs out
	 */
	async reset () {
	    await this.init(); 
		
	    return mixpanel.reset();
	}
}

const Mixpanel = new MixpanelLibrary();

export default Mixpanel;
