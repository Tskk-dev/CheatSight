# Student guide

[Back to CheatSight](../README.md) · [Facilitator guide](FACILITATOR-GUIDE.md)

## If you are taking a Google Forms test

Open the **CheatSight student link** from your teacher, enter your display name, read and acknowledge the monitoring notice, then choose **Join session**. No extension is required for Test sessions. Complete and submit the form inside the page before choosing **Finish & stop monitoring**. CheatSight does not submit your answers for you.

## If you are joining a Google Meet session

Use desktop Chrome or Microsoft Edge. Install CheatSight in the **same browser and browser profile** you will use for the call. The steps below are for the current unpacked testing version; CheatSight is not yet listed in either extension store. You do not need to install Node.js or download the whole website.

### 1. Download and extract the extension

1. Open the **CheatSight student session link** your teacher shares. This is a link ending in `/join/…`, not the `meet.google.com` call link.
2. Choose **Download Chrome / Edge extension**. You can also [download the extension directly from this repository](https://github.com/Tskk-dev/CheatSight/raw/refs/heads/main/public/CheatSight-extension.zip).
3. Extract/unzip `CheatSight-extension.zip` into a folder you can keep. On Windows, right-click the ZIP and choose **Extract All**; on macOS, double-click the ZIP.
4. Open the extracted folder and find `manifest.json`. You will select the folder containing that file in the next step. Do not select the ZIP itself. Keep the extracted files in place while the extension is installed.

### 2. Install in your browser

**Google Chrome**

1. Type `chrome://extensions` into the address bar and press Enter.
2. Turn on **Developer mode**.
3. Choose **Load unpacked** and select the extracted folder containing `manifest.json`.
4. Check that **CheatSight — Meet tab monitor** appears and is enabled.
5. Open the browser's **Extensions** menu (the puzzle-piece icon). Choose CheatSight to open it; optionally pin it to the toolbar.

These steps follow [Chrome's official unpacked-extension instructions](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked).

**Microsoft Edge**

1. Type `edge://extensions` into the address bar and press Enter.
2. Turn on **Developer mode**.
3. Choose **Load unpacked** and select the extracted folder containing `manifest.json`.
4. Check that **CheatSight — Meet tab monitor** appears and is enabled.
5. Open the browser's **Extensions** menu and choose CheatSight.

These steps follow [Microsoft's official local-extension instructions](https://learn.microsoft.com/en-us/microsoft-edge/extensions/getting-started/extension-sideloading).

If your school blocks Developer mode or **Load unpacked**, tell your teacher or school IT. You cannot complete this installation on that managed browser without their help.

### 3. Connect to your teacher's session

1. Return to the student page and choose **Copy student session link**.
2. Open CheatSight from your browser's Extensions menu.
3. Paste that link into **Student session link**. Do not paste the Google Meet URL.
4. Enter the display name your teacher knows.
5. Read and check the monitoring acknowledgment, then choose **Connect monitoring**.
6. Allow access to your teacher's CheatSight website when the browser asks. This permission lets the extension send your activity log to that site.
7. Confirm the popup says **Monitoring connected**.
8. Choose **Open Google Meet** in the extension. Sign in or request admission as usual. Keep the assigned call in this same browser profile.

Opening the call alone does not connect CheatSight. Until the assigned Meet tab is first active, the teacher sees **Waiting for Meet**. Once it is active, they see **Meet active**. The extension popup says **Assigned Meet tab is active**.

### 4. During and after the call

Switching to another tab, window, or app, minimizing the browser, or closing the assigned Meet tab is recorded as being away. Returning to the assigned tab records that it is active again. A different Google Meet room does not count as the assigned room. You can close the extension popup after connecting; the extension continues monitoring.

When you are done, open CheatSight and choose **Finish & stop monitoring**. Wait for **Monitoring is off** before closing the browser. If it says **Finishing — waiting to sync**, keep the browser open and restore your connection. Leave the Google Meet call separately; finishing CheatSight does not end the call.

If you restart the browser, connect again with the student link. This creates a new participant entry, so tell your teacher. The pairing is temporary and does not survive a browser restart.

## What your teacher can see

For Meet sessions, your teacher can see your display name, when monitoring connected, when the assigned Meet tab/window became active or inactive, time away, recent connection status, and when you finish. They can download these logs.

The extension does not send call audio/video, chat, screenshots, keystrokes, mouse movements, or other websites' URLs. It checks tab/window focus, not whether you have actually joined the call or are paying attention. Away events do not prove cheating. Monitoring can be interrupted by browser or network problems. Server logs disappear on a server restart or after 24 hours unless your teacher downloaded a copy.

## Troubleshooting

| What you see | What to do |
| --- | --- |
| Cannot find `manifest.json` / failed to load | Extract the ZIP first. Select the folder directly containing `manifest.json`, not its parent or the ZIP. |
| Cannot find the CheatSight icon | Open the browser's Extensions menu. Check the extension is enabled on its extensions page. |
| A request for the student link | Paste your teacher's CheatSight `/join/…` link, not the Meet link or dashboard address. |
| Site access is required | Connect again and allow access to the specific CheatSight site when prompted. |
| Waiting for Meet | Open the exact assigned meeting in the browser/profile where CheatSight is installed, and make that tab active. |
| Session not found / ended | Ask your teacher for a current student link. Restarting the CheatSight server clears sessions. |
| No recent signal / waiting to sync | Check your internet and that the extension is enabled. Keep the browser open. The service may need time to wake up. |
| Developer mode is blocked | Ask your teacher or school IT for an approved installation method. |

To remove CheatSight after finishing, open your browser's extensions page and choose **Remove** on its card. To update it, finish any current monitoring first, extract the new ZIP into the same folder, then choose **Reload** on the extension's card. Connect again for your next session.
