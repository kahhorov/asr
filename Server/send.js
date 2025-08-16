// import { TelegramClient } from "telegram";
// import { StringSession } from "telegram/sessions/index.js";
// import input from "input";

// const apiId = 28826605; // sizning api_id
// const apiHash = "2de06bf44ed92df5be19d4fc573b16aa"; // sizning api_hash
// const stringSession = new StringSession(""); // birinchi marotaba bo'sh

// const client = new TelegramClient(stringSession, apiId, apiHash, {
//   connectionRetries: 5,
// });

// (async () => {
//   await client.start({
//     phoneNumber: async () =>
//       await input.text("Telefon raqamingizni kiriting: "),
//     password: async () =>
//       await input.text(
//         "2FA parolingiz bo'lsa kiriting (agar bo'lmasa Enter): "
//       ),
//     phoneCode: async () => await input.text("SMS kodni kiriting: "),
//     onError: (err) => console.log(err),
//   });

//   console.log("✅ SESSION STRING (copy qilib saqlab qo'ying):");
//   console.log(client.session.save());
//   console.log(
//     "Endi dasturga clientga xabar yuborish funksiyasini yozishingiz mumkin!"
//   );

//   // test uchun avtomatik yuborish:
//   /*
//   const receiver = "username_yoki_id"; // masalan '@kohhorovv' yoki 8191793504
//   await client.sendMessage(receiver, { message: "USERBOT orqali yuborildi!" });
//   console.log("Xabar yuborildi!");
//   process.exit();
//   */
// })();

import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";

const apiId = 28826605;
const apiHash = "2de06bf44ed92df5be19d4fc573b16aa";
const stringSession = new StringSession("1AgAOM...");

(async () => {
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });
  await client.connect();

  const receiver = process.argv[2];
  const message = process.argv.slice(3).join(" ");

  await client.sendMessage(receiver, { message });
  console.log("✅ Yuborildi");
  process.exit();
})();
