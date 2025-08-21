import React, { useEffect, useState } from 'react';
import { 
	IonContent,
	IonPage
} from '@ionic/react';

import InfoHelper from '@/libraries/InfoHelper';
import Authentication from '@/libraries/Authentication';

import DataError from '@/components//DataError';

import './Login.scss';
import Mixpanel from '@/libraries/Mixpanel';

import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';

import { REGEXP_ONLY_DIGITS_AND_CHARS } from 'input-otp';
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot
} from '@/components/ui/input-otp';
import { useHistory } from 'react-router-dom';
  
const Login: React.FC = () => {
	const [email, setEmail] = useState('');
	const [verificationCode, setVerificationCode] = useState('');
	const [metadata, setMetadata] = useState<any>({});
	const [verificationCodeRequested, setVerificationCodeRequested] = useState<null|any>(null);
	const history = useHistory();

	async function loginOrRegister () {
		await InfoHelper.showLoading();

		try {
			if (verificationCodeRequested.exists) {
				await Authentication.login(email, verificationCode);

				await Mixpanel.track('login');
			}
			else {
				const meta = { ...metadata };

				if (!meta.integrated) {
					meta.time_to_integrate = '0hr to 1hr';
				}
				
				await Authentication.createUser(email, verificationCode, meta);
			
				await Mixpanel.track('create_user');
			}

			// Reditect page authenticated
			history.replace('/');

			await InfoHelper.hideLoading();
		}
		catch (error) {
			console.log(error);

			await InfoHelper.hideLoading();
			
			if (!error?.response?.data?.data_errors) {
				await InfoHelper.showErrorAlert();
			}
			else if (error?.response?.data?.data_errors?.verification_code) {
				setVerificationCode('');
			}
		}
	}

	async function getVerificationCode () {
		await InfoHelper.showLoading();

		setVerificationCodeRequested(null);
		setMetadata({});

		try {
			const res = await Authentication.createVerificationCode(email);

			setVerificationCodeRequested(res);

			await InfoHelper.hideLoading();
		}
		catch (error) {
			console.log(error);

			await InfoHelper.hideLoading();
			
			if (!error?.response?.data?.data_errors) {
				await InfoHelper.showErrorAlert();
			}
		}
	}

	useEffect(() => {
		Mixpanel.track('LoginPage');
	}, []);

	return (
		<IonPage className="login-page">
			<IonContent>

				<div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
					<div className="flex w-full max-w-md flex-col gap-6">
						<a href="/" className="flex items-center gap-2 self-center font-medium">
							<div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
								<img className='h-5 w-5 hidden dark:block' src="/assets/icon/icon-black-x256.png" alt=""/>
								<img className='h-5 w-5 dark:hidden' src="/assets/icon/icon-white-x256.png" alt=""/>
							</div>
							Buglesstack
						</a>
						<div className='flex flex-col gap-6'>
							<Card>
								<CardHeader className="text-center">
									<CardTitle className="text-xl">Welcome</CardTitle>
									<CardDescription>
										Access your Buglesstack account
									</CardDescription>
								</CardHeader>
								<CardContent>
									<form onSubmit={(e) => {
										e.preventDefault();
										verificationCodeRequested ? loginOrRegister() : getVerificationCode();
									}}>
										<div className="grid gap-6">
											<div className="grid gap-6">
												{/* Email input */}
												<div className="grid gap-2">
													<Label htmlFor="email">Use your email to log in or sign up</Label>
													<Input
														id="email"
														type="email"
														defaultValue={email} 
														placeholder="email@example.com"
														required
														onChangeCapture={e => {
															setEmail(e.currentTarget.value);
															setVerificationCodeRequested(null);
														}}
													/>
													<DataError name="email" />
												</div>

												{
													verificationCodeRequested && <>
														{!verificationCodeRequested.exists && <>
															<p className='mt-2 text-md font-semibold text-center'>Fill in the information below to sign up</p>
															
															{/* Metadata: Acquisition source */}
															<div className="grid gap-2">
																<Label htmlFor="time_to_integrate">How did you hear about Buglesstack?</Label>
																<Select value={metadata.source} onValueChange={value => setMetadata((v: any) => ({ ...v, source: value }))}>
																	<SelectTrigger id="source">
																		<SelectValue placeholder="Choose an option" />
																	</SelectTrigger>
																	<SelectContent>
																		<SelectItem value="recomendation">By recommendation</SelectItem>
																		<SelectItem value="youtube">From a YouTube video</SelectItem>
																		<SelectItem value="blog">From a blog tutorial</SelectItem>
																		<SelectItem value="github">Found it on GitHub</SelectItem>
																		<SelectItem value="google">Found it on Google</SelectItem>
																		<SelectItem value="no_memory">I don't remember</SelectItem>
																		<SelectItem value="other">Other</SelectItem>
																	</SelectContent>
																</Select>
																<DataError name="metadata.source" />
															</div>
														</>}

														{/* Verification code input */}
														<div className="grid gap-2">
															<Label htmlFor="verification_code" className='text-center'>Enter your verification code</Label>
															
															<InputOTP 
																id='verification_code'
																maxLength={6}
																pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
																value={verificationCode}
																type="text"
																inputMode='text'
																autoComplete='off'
																minLength={6}
																onChangeCapture={e => {
																	setVerificationCode(e.currentTarget.value);
																}}
																containerClassName='justify-center'
																required
															>
																<InputOTPGroup>
																	<InputOTPSlot index={0} />
																	<InputOTPSlot index={1} />
																	<InputOTPSlot index={2} />
																	<InputOTPSlot index={3} />
																	<InputOTPSlot index={4} />
																	<InputOTPSlot index={5} />
																</InputOTPGroup>
															</InputOTP>
															<DataError className='text-center' name="verification_code" />
														</div>
														<p className='text-center text-xs -mt-4 text-muted-foreground'>
															We sent a verification code to {email}
														</p>
													</>
												}

												<Button className="w-full" type='submit'>
													{
														verificationCodeRequested 
															? (verificationCodeRequested.exists ? 'Go in' : 'Sign up') 
															: 'Get email verification code'
													}
												</Button>

											</div>
										</div>
									</form>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</IonContent>
		</IonPage>
	);
};

export default Login;
