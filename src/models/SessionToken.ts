import { JsonObject, JsonProperty } from 'json2typescript';

@JsonObject('SessionToken')
export class SessionToken {
	@JsonProperty('id', String) id: string = '';
	@JsonProperty('role', String) role: string = '';
	@JsonProperty('access_token', String) accessToken: string = '';
	@JsonProperty('refresh_token', String) refreshToken: string = '';
	@JsonProperty('expires_at', String) expiresAt: string = '';
	@JsonProperty('updated_at', String) updatedAt: string = '';

	/**
	 * True if half the duration time has already passed  
	 **/
	public get isRefreshRequired () : boolean {
	    const updatedAt = new Date(this.updatedAt).getTime();
	    const expiresAt = new Date(this.expiresAt).getTime();
	    const now = Date.now();

	    return ((expiresAt - updatedAt) / 2) < now - updatedAt;
	}
}
