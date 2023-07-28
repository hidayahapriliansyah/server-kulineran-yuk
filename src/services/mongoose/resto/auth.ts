import { Request } from 'express';
import Restaurant, { IRestaurant } from '../../../models/Restaurant';
import { z } from 'zod';
import RestaurantVerification from '../../../models/RestaurantVerification';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import db from '../../../db';

const SignupBodyForm = z.object({
	name: z.string().regex(/^[a-zA-Z0-9.,_\s-]+$/).min(3).max(50).nonempty(),
	username: z.string().regex(/^[a-zA-Z0-9._']+$/).min(3).max(30).nonempty(),
	email: z.string().email().max(254).nonempty(),
	password: z.string().min(6).nonempty(),
});

type SignupBodyForm = z.infer<typeof SignupBodyForm>;
type SignupPayload = SignupBodyForm & { passMinimumProfileSetting: boolean };

const signupForm = async (req: Request): Promise<IRestaurant['_id'] | Error> => {
	const body: SignupBodyForm = SignupBodyForm.parse(req.body);
	const payload: SignupPayload = {
		...body,
		passMinimumProfileSetting: true,
	};

	const session = await db.startSession();
	try {
		session.startTransaction();

		const result = await Restaurant.create(payload);

		const { _id: restaurantId, email: restaurantEmail } = result;
		const now = moment();
		const expiredAt = now.add(10, 'minutes').utc().format();
		const uniqueString = uuidv4();

		await RestaurantVerification.create({
			restaurantId: restaurantId,
			email: restaurantEmail,
			uniqueString,
			expiredAt,
		});

		await session.commitTransaction();
		await session.endSession();

		return result._id;
	} catch (error) {
		await session.abortTransaction();
		await session.endSession();

		throw error;
	}
};

export { signupForm };
