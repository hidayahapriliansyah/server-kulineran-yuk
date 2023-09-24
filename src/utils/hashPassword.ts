import bcrypt from 'bcryptjs';

const hashPassword = async (password: string): Promise<string> => {
  const hashedPassword = await bcrypt.hash(password, 12);

  return hashedPassword;
};

export default hashPassword;
