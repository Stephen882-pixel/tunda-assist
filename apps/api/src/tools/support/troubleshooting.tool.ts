import { Injectable } from '@nestjs/common';

export type TroubleshootingIssueType =
  | 'pump_not_starting'
  | 'low_water_output'
  | 'system_locked'
  | 'battery_not_charging'
  | 'solar_panel_issue'
  | 'controller_lights'
  | 'drip_irrigation_issue'
  | 'escalate_technician';

@Injectable()
export class TroubleshootingTool {
  diagnose(issueType: TroubleshootingIssueType): string {
    switch (issueType) {
      case 'pump_not_starting':
        return this.pumpNotStarting();
      case 'low_water_output':
        return this.lowWaterOutput();
      case 'system_locked':
        return this.systemLocked();
      case 'battery_not_charging':
        return this.batteryNotCharging();
      case 'solar_panel_issue':
        return this.solarPanelIssue();
      case 'controller_lights':
        return this.controllerLights();
      case 'drip_irrigation_issue':
        return this.dripIrrigationIssue();
      case 'escalate_technician':
        return this.escalateTechnician();
      default:
        return this.generalDiagnosis();
    }
  }

  private pumpNotStarting(): string {
    return (
      'Let us check a few things together — this should only take a minute. ' +
      'First: is the solar panel clean and positioned in direct sunlight right now? Dust or shade on the panel is one of the most common reasons the pump will not start. ' +
      'Second: look at the controller — are there any lights on it at all? Even a blinking light tells us a lot. ' +
      'Third: is your account up to date? If there are missed payments, the system locks automatically. You can check by dialing *384*02# from your phone. ' +
      'Can you tell me — is the panel getting good direct sunlight, and what lights, if any, do you see on the controller?'
    );
  }

  private lowWaterOutput(): string {
    return (
      'Low water output usually has one of three causes — let me walk you through them quickly. ' +
      'First: check whether the solar panel is clean and getting full direct sunlight. Partial shade reduces pump power significantly. ' +
      'Second: check for any kinks, bends, or blockages in the pipe between the pump and your irrigation point. Even a partial blockage drops the flow rate. ' +
      'Third: the depth of your water source matters — as the water table drops in dry season, the pump works harder and output can reduce. ' +
      'Is this a sudden drop in output, or has it been getting gradually lower over time?'
    );
  }

  private systemLocked(): string {
    return (
      'A locked system almost always means the account has a missed or late payment — the system locks automatically when payments fall behind. ' +
      'The good news: it unlocks automatically within minutes of your payment going through. You do not need to call us or wait for a technician. ' +
      'To check your exact balance and what is owed, dial *384*02# from your phone. ' +
      'To make a Lipa Polepole instalment payment, use M-Pesa Paybill 862451 with your National ID as the account number. ' +
      'Once the payment processes, your system will unlock on its own. ' +
      'Is there anything about the payment that I can help clarify?'
    );
  }

  private batteryNotCharging(): string {
    return (
      'If the battery is not charging, let us start with the most common causes. ' +
      'First: is the solar panel clean, undamaged, and facing the sun directly? Even partial shading from a tree or building will significantly reduce charging. ' +
      'Second: check that all cables between the panel and the controller are firmly connected and undamaged. A loose connection stops charging. ' +
      'Third: the CSB2 takes approximately 3 hours to fully charge at good solar irradiance. If you are checking in the morning after a cloudy afternoon, the battery may simply need more sun time. ' +
      'What does the controller display or indicator light show right now?'
    );
  }

  private solarPanelIssue(): string {
    return (
      'Solar panels are generally very low maintenance, but here are the things to check. ' +
      'First: clean the panel surface with a damp cloth — dust, bird droppings, or debris on the glass reduces power output significantly. ' +
      'Second: make sure nothing is casting a shadow on the panel — even a small shadow from a branch or building reduces output. ' +
      'Third: inspect the cable from the panel to the controller for any visible damage, cuts, or loose connections at either end. ' +
      'If the panel looks physically damaged — cracked glass, broken frame — that is covered under your 3-year warranty. Call our support line 0800 721 042 and we will arrange a replacement. ' +
      'Is there any visible damage to the panel, or does it look physically fine?'
    );
  }

  private controllerLights(): string {
    return (
      'The controller lights give you important information about your system status. ' +
      'A solid green light means the system is running normally. ' +
      'A blinking green light means the battery is charging from solar. ' +
      'A red or amber light often indicates a fault — it could be a low battery, a pump fault, or a connectivity issue. ' +
      'No lights at all usually means there is no power reaching the controller — check the solar panel connection and cable. ' +
      'If you are seeing a red or amber light consistently and the system is not working, that typically needs a technician to diagnose properly. ' +
      'What colour light are you seeing right now, and is it solid or blinking?'
    );
  }

  private dripIrrigationIssue(): string {
    return (
      'Drip irrigation issues are usually one of three things. ' +
      'First: check the filter — the filtration unit at the start of the drip system traps debris and can get clogged over time. Remove it and rinse it clean with water. ' +
      'Second: check the pressure regulator valve — if water flow to the drip lines is very low, this valve may need adjustment. ' +
      'Third: inspect the drip tape itself for any holes, kinks, or rodent damage — small animals sometimes chew through the tape near the soil surface. ' +
      'The drip system comes with a 2-year warranty. If there is physical damage to the components and it is within warranty, we will replace them. ' +
      'Is the issue that no water is coming through at all, or that flow is uneven across different sections?'
    );
  }

  private escalateTechnician(): string {
    return (
      'I want to make sure your system is properly looked after, and this sounds like something our technical team needs to handle directly. ' +
      'I will flag this for escalation now. A SunCulture field engineer will follow up with you to arrange a visit or give you more specific guidance. ' +
      'In the meantime, our toll-free support line is 0800 721 042 — available any time — if the issue becomes urgent or you have not heard back within 24 hours. ' +
      'Can I confirm the best phone number to reach you on, and the county or area you are in, so we can route this to the right team?'
    );
  }

  private generalDiagnosis(): string {
    return (
      'Let me help you work through this. To point you in the right direction, I need a bit more information. ' +
      'Is the issue with the pump not starting, low water output, the battery or charging, the solar panel, or something else? ' +
      'And is your account up to date — you can check quickly by dialing *384*02#. ' +
      'Tell me what you are seeing and we will figure it out together.'
    );
  }
}
