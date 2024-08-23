
# 3Mail Contact

**3Mail Contact** is a decentralized contact form built on the Internet Computer (ICP) blockchain. This application allows users to securely send messages to an administrator, who can only access these messages after authenticating with their Internet Identity. The messages are stored on-chain, ensuring privacy and security.

## Features

- **Secure Message Submission:** Users can submit messages through a contact form without needing to log in.
- **Admin Portal:** Only administrators with approved Principal IDs (PIDs) can access and manage submitted messages.
- **Real-Time Counters:** Counters for the total number of messages sent, received, and unviewed are updated in real-time.
- **Confirmation for Deletion:** Admins receive a confirmation prompt before deleting all messages.
- **User-Friendly Interface:** After submitting a message, users see a thank you message and a button to return to their previous browser tab.
- **Dynamic Advertising:** Displays one of three random ads at the bottom of the page, each linking to a different URL. Users can add more ads, but the original three must remain in the random rotation.

## Getting Started

### Prerequisites

- Node.js (for local development)
- DFX SDK (to deploy and interact with Internet Computer canisters)
- Internet Identity (for admin login)

### Downloading the Repository

1. Clone the repository from GitHub:

   ```bash
   git clone https://github.com/yourusername/3mail-contact.git
   cd 3mail-contact
   ```

### Starting the Local Replica

To test 3Mail Contact locally:

1. Start the DFX replica:

   ```bash
   dfx start --background
   ```

2. Deploy the canisters locally:

   ```bash
   dfx deploy
   ```

### Configuring Canisters for Mainnet Deployment

Before deploying to the Internet Computer mainnet:

1. Update the `canister_ids.json` file with your own canister IDs. You can find this file in the `.dfx` directory after running the `dfx deploy` command.

2. Replace the placeholder Principal IDs in the code with your own approved PIDs. This ensures that only you (or those you designate) can access the admin section.

3. Redeploy the application:

   ```bash
   dfx deploy --network ic
   ```

### Accessing the Application

Once deployed, your application will be accessible via a URL like:

```
https://<your-canister-id>.ic0.app
```

You can also visit the live version of this app at:

```
https://7ttbk-wqaaa-aaaak-qiu7a-cai.icp0.io/
```

This URL will allow users to access the contact form, while the admin section will be restricted to those with approved PIDs.

### Using 3Mail Contact

1. **Submitting Messages:**
   - Users simply enter their email or 3Mail address, name, subject, and message, then press "Send Message."
   - After submission, they will see a thank you message and have the option to return to their previous browser tab.

2. **Admin Access:**
   - To view messages, log in using your Internet Identity.
   - Only those with approved PIDs can access the admin portal.
   - The admin portal provides options to view all messages, view unviewed messages, delete messages, and reset message counters.

3. **Advertising:**
   - The app features a dynamic advertising section at the bottom of the page.
   - Three images are randomly displayed, each linking to a different URL.
   - **Customizing Ads:** You can replace the images or URLs by modifying the `ads` array in the `App.jsx` file. New ads can be added, but the original three ads must remain in the rotation to maintain the integrity of the app.
   - The original ads are a part of the 3Mail Contact brand and must be preserved in any deployed version.

### Customization

- **Admin PIDs:**
  - Modify the `main.mo` file to add or change the list of approved Principal IDs. This will control who has access to the admin functions.
  
- **Styling:**
  - Customize the `index.scss` file to change the look and feel of the contact form.

### Credits

- **3Mail Contact** is brought to you by [RichardHery.com](https://richardhery.com).
- RichardHery.com also provides [3Mail.us](https://3mail.us), offering cool web3 messaging capabilities on the Internet Computer Protocol blockchain.

### Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Acknowledgments

- Built using the DFINITY Internet Computer SDK.
- Inspired by the need for secure and decentralized communication tools.
