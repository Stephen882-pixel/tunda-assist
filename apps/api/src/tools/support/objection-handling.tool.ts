import { Injectable } from '@nestjs/common';

export type ObjectionType =
  | 'price_too_expensive'
  | 'deposit_too_high'
  | 'solar_company_distrust'
  | 'what_if_it_breaks'
  | 'need_to_consult_family'
  | 'let_me_think'
  | 'water_source_too_deep'
  | 'already_have_petrol_pump'
  | 'fraud_concerns'
  | 'volume_requirements_unclear';

@Injectable()
export class ObjectionHandlingTool {
  handleObjection(objectionType: ObjectionType): string {
    switch (objectionType) {
      case 'price_too_expensive':
        return this.priceTooExpensive();
      case 'deposit_too_high':
        return this.depositTooHigh();
      case 'solar_company_distrust':
        return this.solarCompanyDistrust();
      case 'what_if_it_breaks':
        return this.whatIfItBreaks();
      case 'need_to_consult_family':
        return this.needToConsultFamily();
      case 'let_me_think':
        return this.letMeThink();
      case 'water_source_too_deep':
        return this.waterSourceTooDeep();
      case 'already_have_petrol_pump':
        return this.alreadyHavePetrolPump();
      case 'fraud_concerns':
        return this.fraudConcerns();
      case 'volume_requirements_unclear':
        return this.volumeRequirementsUnclear();
      default:
        return this.generalResponse();
    }
  }

  private priceTooExpensive(): string {
    return (
      'I hear you — and I want to be honest with you, this is not a small purchase. ' +
      'But let me ask you something: how much are you currently spending on fuel or water for your farm each month? ' +
      'Most farmers find that the monthly PAYGO payment is close to what they already spend on fuel — or even less. ' +
      'The difference is that this payment stops after 28 to 36 months. The fuel cost never stops. ' +
      'Over five years, most of our customers save significantly more than the total cost of the system. ' +
      'And if a new system is still a stretch right now, we also have refurbished units — fully inspected and serviced by our technical team — ' +
      'that come with a one-year warranty at a more accessible price. ' +
      'Would it help if I walked you through what the monthly payment would look like compared to your current costs?'
    );
  }

  private depositTooHigh(): string {
    return (
      'I understand — the deposit is a real amount and I will not pretend it is nothing. ' +
      'But here is what it does: it secures your installation, locks in your monthly rate, and the system is yours from day one. SunCulture does not take it back. ' +
      'Can I ask — is the deposit the main barrier, or is it the monthly amount as well? ' +
      'Sometimes if it is a matter of a few weeks, we can look at scheduling your installation for when the timing works better for you. ' +
      'And if the deposit for a new unit is truly the blocker even after that, we do have refurbished systems available at a lower entry point. ' +
      'What would make this more workable for you?'
    );
  }

  private solarCompanyDistrust(): string {
    return (
      'I appreciate you telling me that — and I will not dismiss it. There are solar companies that have not delivered, and I understand why that creates doubt. ' +
      'Let me tell you specifically what SunCulture does differently. ' +
      'We have been operating in Kenya for over ten years. We have more than 50% market share for smallholder solar irrigation in East Africa. ' +
      'We offer a three-year warranty on the pump, two years on drip irrigation. Free delivery. Free installation. ' +
      'We have a toll-free customer support line — 0800 721 042 — that you can call any time. ' +
      'And here is the most important thing: because you pay monthly, if our system breaks and we do not respond, you stop paying. ' +
      'That gives us a very direct reason to make sure your system keeps working. We have skin in the game too. ' +
      'Is there a specific concern I can address directly?'
    );
  }

  private whatIfItBreaks(): string {
    return (
      'That is one of the most important questions you can ask, and I am glad you did. ' +
      'SunCulture has field engineers and a dedicated customer support team across Kenya. ' +
      'Every system comes with a three-year warranty on the pump, panel, and controller. Drip irrigation has a two-year warranty. ' +
      'Our toll-free support line is 0800 721 042 — available to all customers. ' +
      'But here is what really matters: because you pay monthly on PAYGO, if we do not respond to a breakdown, you stop paying. ' +
      'That is a very direct incentive for us to keep your system running. We are not a company that disappears after the sale — ' +
      'your after-sales experience is part of our business model, not an afterthought. ' +
      'Is there anything else about after-sales support I can clarify for you?'
    );
  }

  private needToConsultFamily(): string {
    return (
      'Absolutely — this is a family decision and it should be. ' +
      'I completely respect that. ' +
      'Can I ask: would it be possible for us to connect at a time when your spouse or family member is also available? ' +
      'Even thirty minutes together would let me answer any questions they might have directly — ' +
      'things like how the payments work, what happens if something breaks, whether neighbors have had positive experiences. ' +
      'It is much easier for me to address those questions than to have you try to explain everything with only half the picture. ' +
      'When would be a good time to call back when you are together?'
    );
  }

  private letMeThink(): string {
    return (
      'Of course — I completely respect that. ' +
      'Can I ask: is there a specific concern holding you back, or is it mainly timing? ' +
      'I ask because sometimes when I follow up, the issue turns out to be something we could have sorted out today. ' +
      'If it is genuinely about timing, let us lock in a specific date now — which day works for a follow-up call? ' +
      'And in the meantime, if you want to speak with an existing SunCulture customer in your area, ' +
      'I can try to arrange that — you can ask them directly about their experience, without me in the conversation. ' +
      'What is the best number to reach you on for a follow-up?'
    );
  }

  private waterSourceTooDeep(): string {
    return (
      'That is exactly why we do a proper assessment before recommending any system. ' +
      'We would never put a product on your farm that does not fit — that is bad for you and bad for us. ' +
      'Our systems cover a wide range of depths: the RainMaker2S handles up to 70 metres for the Direct system and up to 60 metres for the Battery system. ' +
      'The RainMaker2CK handles up to 35 metres but at a much higher flow rate. ' +
      'If you can tell me roughly how deep your water source is and what your flow rate looks like, ' +
      'I can tell you honestly which system fits — or whether we are not the right match at all. ' +
      'I would rather tell you the truth now than have you pay for something that does not work. ' +
      'How deep would you estimate your water source is?'
    );
  }

  private alreadyHavePetrolPump(): string {
    return (
      'I hear you — and yes, a petrol pump is cheaper to buy upfront. That is true. ' +
      'But let us look at the full picture. At KES 3,000 per month on fuel, that is KES 36,000 a year. That never stops. ' +
      'Our monthly PAYGO payment is similar to that figure — but it stops after 28 months. ' +
      'After that, your water is essentially free. No fuel to buy. No fuel supply chain to worry about. ' +
      'Over five years, you will spend two to three times more on petrol than the total cost of our system. ' +
      'And petrol prices only go in one direction. ' +
      'The question is not which is cheaper today — it is which costs you less over the next five years. ' +
      'Would you like me to work through the numbers based on what you are currently spending on fuel?'
    );
  }

  private fraudConcerns(): string {
    return (
      'That is a very real concern and I am sorry that has happened to people. ' +
      'I want to be completely clear about how SunCulture works: ' +
      "we never ask customers to pay via anyone's personal M-Pesa number. " +
      'All payments go through official SunCulture company accounts only. ' +
      'If anyone ever asks you to send money to a personal number claiming to be from SunCulture, do not send it — call our toll-free line on 0800 721 042 to verify immediately. ' +
      'You can also call that number right now to confirm that you are speaking with an official SunCulture representative. ' +
      'We want you to feel completely safe before you make any commitment. ' +
      'Is there anything specific I can help you verify?'
    );
  }

  private volumeRequirementsUnclear(): string {
    return (
      'That is a fair and important question for your operation. ' +
      'Rather than guess, let me be specific. Our systems cover a range: ' +
      'the RainMaker2S delivers up to 1,100 litres per hour from depths up to 60 to 70 metres. ' +
      'The RainMaker2CK delivers up to 2,750 to 3,000 litres per hour from shallower sources. ' +
      'If you can tell me your required daily output in litres and your water source depth, ' +
      'I can tell you exactly which system meets your specification — or if we need to configure something custom. ' +
      'And if we cannot meet your requirements, I will tell you honestly right now. ' +
      'I would rather have an honest conversation than sell you something that does not perform. ' +
      'What is your daily water requirement?'
    );
  }

  private generalResponse(): string {
    return (
      'That is a fair concern — I hear you. ' +
      'Can you tell me a bit more about what is holding you back? ' +
      'Whatever the question is — about price, reliability, how it works on your specific farm — ' +
      'I would rather address it directly than leave you with any doubt. ' +
      'What is the main thing on your mind right now?'
    );
  }
}
