import bcrypt from 'bcryptjs';

const comparePassword = async (inputtedPassword: string, hashedPassword: string):
  Promise<boolean> => {
    const isMatch = await bcrypt.compare(inputtedPassword, hashedPassword);
    return isMatch;
  };

export default comparePassword;
