# Facilitator guide

[Back to CheatSight](../README.md) · [Student installation guide](STUDENT-GUIDE.md)

## 1. Open CheatSight

Open your deployed CheatSight site in the browser you will use to manage the session. For hosting setup, see [Deploy on Render](../README.md#deploy-on-render). To try it on your own computer, see [Start locally](../README.md#start-locally).

Your browser cookie controls facilitator access. Keep using the same browser and profile; clearing cookies or switching browsers loses access to its existing sessions. There is no login or account recovery.

## 2. Create a session

Choose **Create session**, give it a title, and select the session type:

| Type | Link to enter | What students need |
| --- | --- | --- |
| **Test** | Full published Google Forms responder URL, such as `https://docs.google.com/forms/d/e/FORM_ID/viewform` | A browser; no extension |
| **Google Meet** | Assigned meeting URL, such as `https://meet.google.com/abc-defg-hij` | Desktop Chrome/Edge and the CheatSight extension |

For Test sessions, choose whether to include mouse activity on the surrounding CheatSight page. Form editor links and `forms.gle` short links are not accepted; use the full responder link. A Meet session needs no Google Form. The planned duration is a guide, not an automatic end timer.

Create the Google Form or Google Meet call separately and set its access permissions as usual. CheatSight does not create meetings, grant admission, or change Google account access.

## 3. Invite students

Open **Invite students**, copy the **Student session link**, and share it. Share student links only, not browser cookies. On the deployed site the link uses your public site address. A `localhost` link works only on the computer running CheatSight; use your deployed HTTPS site for students on other devices.

For **Test**, students enter a name, acknowledge monitoring, and complete the embedded form. They must submit their Google Form before finishing CheatSight.

For **Google Meet**, also share the [student installation guide](STUDENT-GUIDE.md). Each monitored student installs the extension, pastes the CheatSight student link into it, enters a name, acknowledges monitoring, grants site access, and opens the assigned Meet call in that browser. Simply joining the call does not connect monitoring. You do not need the extension just to use the facilitator dashboard. No Google OAuth setup or API keys are required.

Arrange a short practice session before using Meet monitoring with a class. School-managed browsers may block unpacked extensions; ask school IT about approved installation. The current ZIP is for unpacked testing and is not published in an extension store.

## 4. Check activity

Keep the facilitator dashboard open. It refreshes about every five seconds. Select a student to see their event timeline; use search and filters to find students.

For Meet sessions:

| Status | Meaning |
| --- | --- |
| **Waiting for Meet** | Extension connected, but the assigned Meet tab has not yet been observed active. |
| **Meet active** | The assigned meeting is the active tab in the focused browser window. |
| **Away from Meet** | The student switched away after the meeting tab was first observed active. |
| **No recent signal** | The extension has not reported recently; this can mean an interrupted connection or browser timers. |

A focus change is activity evidence, not proof of cheating, attendance, or attention. Meet monitoring does not read the call, chat, other website URLs, or mouse movements. Test monitoring cannot read answers or mouse movement inside the cross-origin Google Forms iframe.

## 5. Finish and save your logs

1. Ask students to choose **Finish & stop monitoring** (in the extension for Meet, on the student page for Test). Meet students leave the call separately.
2. End the CheatSight session from the dashboard to stop further collection.
3. Choose **Download logs** for CSV, or **Session options → Download complete report (JSON)** for session details, students, and events. Downloads contain all students in the selected session even if the table is filtered.
4. Save the files somewhere you can find them later.

**Download before a server restart, redeploy, or sleep.** CheatSight keeps sessions only in server memory; records also expire after 24 hours. There is no persistent disk or database backup. Ending a session does not automatically download its logs, submit a form, or end a Meet call.

## Quick local practice

For Test monitoring, choose **Start local test**, open its student link in a second tab, join, switch away and return, then inspect and download the log. The practice form does not save answers.

For Meet monitoring, create a Google Meet session with a real meeting link, follow the student guide in desktop Chrome/Edge, and check that the dashboard changes from **Waiting for Meet** to **Meet active**, then **Away from Meet** when switching tabs and back when returning. Use a disposable practice session; switching back to check the teacher dashboard is itself an away event for that student.
