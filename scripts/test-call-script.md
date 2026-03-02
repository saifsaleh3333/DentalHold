# Mutual of Omaha Test Call Script for Dani

## IVR (skip if you want to go straight to live rep)

> "Thank you for calling Mutual of Omaha Dental customer service. Your call may be recorded. All benefits quoted are a general outline of coverage and not a guarantee of payment. If you are a member, press 1. If you are a provider, press 2."

*[Dani presses 2 or says "Provider"]*

> "For benefits, press 1. For claims, 2. For questions about the portal, 3."

*[Dani presses 1]*

> "Please hold while we connect you with a specialist."

*[Brief pause, then pick up as live rep]*

---

## Live Rep Intro

> "Thank you for holding, this is Debra with Mutual of Omaha dental provider services. How can I help you?"

*[Dani introduces herself, says she's verifying benefits]*

> "Sure, I can help with that. Can I get the NPI for the office?"

*[Dani gives NPI]*

> "Got it. And the member ID?"

*[Dani gives member ID]*

> "And the patient's date of birth?"

*[Dani gives DOB]*

> "Okay, I have the member pulled up. What do you need?"

---

## Answer Key

Use these values when Dani asks her verification questions.

| Field | Value |
|-------|-------|
| Eligible | Yes |
| Effective Date | January 1st, 2025 |
| In/Out Network | In network |
| Plan Type | PPO |
| Fee Schedule | Standard |
| Plan/Group Name | Mutual of Omaha PPO - Advantage Plan |
| Group Number | 88412 |
| Claims Address | PO Box 30567, Salt Lake City, UT 84130 |
| Payor ID | 46225 |
| Annual Max | $1,500 |
| Max Used | $200 |
| Remaining | $1,300 |
| Max Applies To | Basic and Major only |
| Deductible | $50 |
| Deductible Met | No, $0 applied |
| Deductible Applies To | Basic and Major |
| Ortho Max | None, no ortho benefit |
| Waiting Periods | None for preventive, none for basic, 12 months for major |
| Missing Tooth Clause | Yes |
| Diagnostic | 100% |
| Preventive | 100% |
| Basic | 80% |
| Major | 50% |
| Endo | 80% |
| Perio | 80% |
| Extractions | 80% |
| BWX Frequency | Once every 12 months |
| BWX Last Done | August 2025 |
| Pano Frequency | Once every 5 years |
| Pano Last Done | None on file |
| FMX Frequency | Once every 5 years |
| FMX Last Done | None on file |
| D0150 Frequency | Once every 36 months |
| D0150 Last Done | March 2024 |
| D0120 Frequency | Twice per year |
| D0120 Last Done | August 2025 |
| D0140 Frequency | As needed |
| Exams Share Frequency | No |
| D1110 Frequency | Twice per calendar year |
| D1110 Last Done | August 2025 |
| D4346 Coverage | 80% |
| D4346 Frequency | Falls under prophy benefit (combined) |
| D4346 Shares w/ D1110 | Yes |
| Fluoride Covered | Yes, under age 16 |
| Downgrade Fillings | Yes, to amalgam |
| Downgrade Crowns | Yes, to base metal |
| Crown Frequency | Once every 5 years |
| D7210 Coverage | 80% |
| D7140 Coverage | 80% |
| D4910 Coverage | 80% |
| D4910 Frequency | 4 times per year after active therapy |
| D4341 Frequency | Once every 24 months per quadrant |
| D4341 Last Done | None on file |
| D4342 Frequency | Once every 24 months per quadrant |
| D4342 Last Done | None on file |
| Implants Covered | No |
| Occlusal Guard Covered | Yes |
| Occlusal Guard Coverage | 50% |
| Reference Number | MOO-2026-849371 |
| Rep Name | Debra Wilson |

---

## Curveball Options

Mix in 3-4 of these during the call to test Dani's handling.

### 1. Ask for something Dani might not have

Right after she gives the member ID:

> "I'm not pulling anything up with that. Do you have the subscriber's address on file?"

**Tests:** Does Dani say she doesn't have it and ask for an alternative? Or does she freeze/hang up?

---

### 2. Dump a wall of info at once

When Dani asks about the annual maximum:

> "Yeah so the max is fifteen hundred, two hundred has been used, thirteen hundred remaining. That applies to basic and major only, preventive doesn't count against it. Deductible is fifty dollars, hasn't been met yet, that's also basic and major. No ortho benefit on this plan."

**Tests:** Does Dani catch ALL of that and skip ahead? Or does she re-ask about the deductible? The circle-back fix should help — but does she still ask "Has the deductible been met?" (she should skip it, since you said "hasn't been met yet").

---

### 3. Give an ambiguous eligibility answer

When Dani asks if the patient is eligible:

> "Well, the member is showing as active but there's a note here that says benefits are pending verification by the group. So technically yes, but I'd recommend calling back in 48 hours to confirm."

**Tests:** Does Dani record this as eligible=true? Does she note the caveat? Or does she get confused and re-ask?

---

### 4. Offer to fax mid-conversation

After answering a few questions:

> "Hey, I can actually fax all of this over to your office if you want. It'd have everything — coverage breakdowns, frequencies, all of it. Want me to do that?"

**Tests:** Dani should decline and ask to continue verbally. If she accepts, that's a fail.

---

### 5. Say something is portal-only

When Dani asks about frequencies:

> "The frequency limitations for x-rays I can't actually give you over the phone, you'd need to check that on the provider portal at mutualofomaha.com."

**Tests:** Does Dani note it and move on? Or does she push back or get stuck?

---

### 6. Put her on a mid-conversation hold

After answering 3-4 questions:

> "Oh hold on, I need to check something. Can you hold for just a minute?"

*[Go silent for 60-90 seconds, then come back]*

> "Okay sorry about that. Where were we?"

**Tests:** Does Dani wait silently? Does she say "hold" or filler words? Does she remember where she was and pick up the right next question?

---

### 7. Challenge the member ID

> "The member ID you gave me is pulling up a different patient. Are you sure that's correct? Can you spell the patient's last name for me again?"

*[After she spells it:]*

> "Hmm, I'm showing a different last name on this ID. Do you have the subscriber's Social Security Number? That might be easier."

**Tests:** Does Dani offer SSN if she has it? Does she handle the back-and-forth without re-introducing herself?

---

### 8. Give a confusing frequency answer

When Dani asks about D4346 frequency:

> "D4346... that's gonna fall under the prophy benefit, so whatever the prophy frequency is, that's combined."

**Tests:** Does Dani interpret this as "shares frequency with D1110 = yes" and skip the follow-up? Or does she re-ask?

---

### 9. Interrupt her mid-question

When Dani starts asking about coverage percentages:

> *[Cut her off after "What's the coverage for—"]* "Diagnostic and preventive are both at 100, basic and endo are 80, major is 50. Extractions and perio are also 80."

**Tests:** Does she catch all 7 coverage values and skip the entire section? The circle-back fix should make her verify she didn't miss any.

---

### 10. End the call abruptly

After most questions are answered but before wrap-up:

> "Hey, I'm sorry but I need to take another call. Is there anything urgent you still need? I can give you a reference number real quick."

**Tests:** Does Dani prioritize getting the reference number and rep name before the line drops? Or does she try to ask all remaining questions?

---

## Recommended Test Combo

Start with the base script, then throw in **#2** (info dump), **#6** (mid-hold), **#7** (challenge member ID), and **#9** (interrupt). Those test the exact issues we've patched — batch answer handling, hold behavior, missing info recovery, and the new circle-back logic.
