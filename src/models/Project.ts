import { JsonObject, JsonProperty } from 'json2typescript';

const BILLING_PLANS_FORMMATED = {
	dev: 'Dev',
	pro: 'Pro',
	open_source: 'Open Source'
};

@JsonObject('Project')
export class Project {
	@JsonProperty('id', String) id: string = '';
	@JsonProperty('name', String) name: string = '';
	@JsonProperty('billing_plan', String) billingPlan: string = '';
	@JsonProperty('billing_period', String) billingPeriod: string = '';
	@JsonProperty('access_token', String) accessToken: string = '';
	@JsonProperty('stripe_subscription_id', String, true) stripeSubscriptionId?: string = undefined;
	@JsonProperty('created_at', String) createdAt: string = '';
	@JsonProperty('updated_at', String) updatedAt: string = '';
	@JsonProperty('subscription_status', String, true) subscriptionStatus?: string = undefined;
	@JsonProperty('subscription_trial_end', String, true) subscriptionTrialEnd?: string = undefined;
	@JsonProperty('subscription_current_period_end', String, true) subscriptionCurrentPeriodEnd?: string = undefined;
	@JsonProperty('subscription_cancel_at', String, true, true) subscriptionCancelAt?: string = undefined;
	@JsonProperty('current_period_crashes_usage', Number) currentPeriodCrashesUsage: number = 0;
	@JsonProperty('crashes_limit', Number) crashesLimit: number = 0;

	public get billingPlanFormatted () : string {
		return BILLING_PLANS_FORMMATED[this.billingPlan as keyof typeof BILLING_PLANS_FORMMATED] || '';
	}
	
	public get isSubscriptionActive () : boolean {
		return (this.subscriptionStatus === 'trialing' || this.subscriptionStatus === 'active') &&
			!this.subscriptionCancelAt;
	}
	
	public get isSubscriptionCanceled () : boolean {
		return this.subscriptionStatus === 'canceled';
	}
	
	public get isSubscriptionPaused () : boolean {
		return this.subscriptionStatus === 'paused';
	}
	
	public get isSubscriptionPastDue () : boolean {
		return this.subscriptionStatus === 'past_due';
	}
}

@JsonObject('UserProject')
export class UserProject {
	@JsonProperty('id', String) id: string = '';
	@JsonProperty('role', String) role: string = '';
	@JsonProperty('created_at', String, true) createdAt?: string;
	
	@JsonProperty('project', Project) project: Project = new Project();
}
