import { JsonObject, JsonProperty } from 'json2typescript';

@JsonObject('User')
export class User {
	@JsonProperty('id', String) id: string = '';
	@JsonProperty('email', String) email: string = '';
	@JsonProperty('created_at', String) createdAt: string = '';
	@JsonProperty('subscription_status', String) subscriptionStatus: string = '';
	@JsonProperty('has_payment_method', Boolean) hasPaymentMethod: boolean = false;

	get avatarFallback (): string {
		return this.email.substring(0, 2).toUpperCase();
	}

	get username (): string {
		return this.email.split('@')[0];
	}
}
