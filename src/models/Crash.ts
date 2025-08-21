import { Any, JsonObject, JsonProperty } from 'json2typescript';

@JsonObject('Crash')
export class Crash {
	@JsonProperty('id', String) id: string = '';
	@JsonProperty('html', String) html: string = '';
	@JsonProperty('screenshot', String) screenshot: string = '';
	@JsonProperty('message', String) message: string = '';
	@JsonProperty('url', String) url: string = '';
	@JsonProperty('stack', String) stack: string = '';
	@JsonProperty('metadata', Any) metadata: any = {};
	@JsonProperty('created_at', String) createdAt: string = '';
}
