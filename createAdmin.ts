import { createAdminUser } from '../src/lib/firebase';

const email = 'admin@worldskills.be';
const password = 'WorldSkills2024!';

createAdminUser(email, password)
  .then((user) => {
    console.log('Admin user created successfully:', user.email);
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error creating admin user:', error);
    process.exit(1);
  });
