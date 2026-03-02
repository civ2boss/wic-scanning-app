import { describe, it, expect } from 'vitest';
import { checkEligibility, getParticipantBenefits, PARTICIPANT_LABELS } from './eligibility';
import type { ParticipantType } from './db';

describe('checkEligibility', () => {
  describe('INFANT_0_6', () => {
    const participantType: ParticipantType = 'INFANT_0_6';

    it('should allow infant formula', () => {
      const result = checkEligibility('formula', 'infant formula', participantType);
      expect(result.eligible).toBe(true);
    });

    it('should allow infant food', () => {
      const result = checkEligibility('infant', 'baby food', participantType);
      expect(result.eligible).toBe(true);
    });

    it('should not allow juice', () => {
      const result = checkEligibility('juice', 'orange juice', participantType);
      expect(result.eligible).toBe(false);
      expect(result.reason).toContain('not allowed');
    });

    it('should not allow vegetables', () => {
      const result = checkEligibility('vegetable', 'carrots', participantType);
      expect(result.eligible).toBe(false);
    });

    it('should not allow milk', () => {
      const result = checkEligibility('milk', 'whole milk', participantType);
      expect(result.eligible).toBe(false);
    });
  });

  describe('INFANT_6_12', () => {
    const participantType: ParticipantType = 'INFANT_6_12';

    it('should allow infant formula', () => {
      const result = checkEligibility('formula', 'infant formula', participantType);
      expect(result.eligible).toBe(true);
    });

    it('should allow produce', () => {
      const result = checkEligibility('produce', 'fresh vegetables', participantType);
      expect(result.eligible).toBe(true);
    });

    it('should not allow milk', () => {
      const result = checkEligibility('milk', 'whole milk', participantType);
      expect(result.eligible).toBe(false);
    });
  });

  describe('CHILD_1_2', () => {
    const participantType: ParticipantType = 'CHILD_1_2';

    it('should allow whole milk only', () => {
      const result = checkEligibility('milk', 'whole milk', participantType);
      expect(result.eligible).toBe(true);
    });

    it('should not allow non-whole milk', () => {
      const result = checkEligibility('milk', '2% milk', participantType);
      expect(result.eligible).toBe(false);
      expect(result.reason).toContain('whole');
    });

    it('should allow whole yogurt only', () => {
      const result = checkEligibility('yogurt', 'whole milk yogurt', participantType);
      expect(result.eligible).toBe(true);
    });

    it('should not allow infant food', () => {
      const result = checkEligibility('infant', 'baby food', participantType);
      expect(result.eligible).toBe(false);
    });

    it('should allow juice', () => {
      const result = checkEligibility('juice', 'apple juice', participantType);
      expect(result.eligible).toBe(true);
    });

    it('should allow produce', () => {
      const result = checkEligibility('produce', 'fresh fruit', participantType);
      expect(result.eligible).toBe(true);
    });
  });

  describe('CHILD_2_5', () => {
    const participantType: ParticipantType = 'CHILD_2_5';

    it('should not allow whole milk', () => {
      const result = checkEligibility('milk', 'whole milk', participantType);
      expect(result.eligible).toBe(false);
    });

    it('should allow low-fat milk', () => {
      const result = checkEligibility('milk', '1% milk', participantType);
      expect(result.eligible).toBe(true);
    });

    it('should not allow infant food', () => {
      const result = checkEligibility('infant', 'baby food', participantType);
      expect(result.eligible).toBe(false);
    });
  });

  describe('PREGNANT', () => {
    const participantType: ParticipantType = 'PREGNANT';

    it('should allow milk', () => {
      const result = checkEligibility('milk', 'whole milk', participantType);
      expect(result.eligible).toBe(true);
    });

    it('should allow yogurt', () => {
      const result = checkEligibility('yogurt', 'yogurt', participantType);
      expect(result.eligible).toBe(true);
    });

    it('should allow cheese', () => {
      const result = checkEligibility('cheese', 'cheddar cheese', participantType);
      expect(result.eligible).toBe(true);
    });

    it('should allow fish', () => {
      const result = checkEligibility('fish', 'canned tuna', participantType);
      expect(result.eligible).toBe(true);
    });

    it('should not allow infant food', () => {
      const result = checkEligibility('infant', 'baby food', participantType);
      expect(result.eligible).toBe(false);
    });
  });

  describe('BREASTFEEDING', () => {
    const participantType: ParticipantType = 'BREASTFEEDING';

    it('should allow all food categories', () => {
      expect(checkEligibility('milk', 'whole milk', participantType).eligible).toBe(true);
      expect(checkEligibility('yogurt', 'yogurt', participantType).eligible).toBe(true);
      expect(checkEligibility('cheese', 'cheese', participantType).eligible).toBe(true);
      expect(checkEligibility('fish', 'fish', participantType).eligible).toBe(true);
      expect(checkEligibility('produce', 'vegetables', participantType).eligible).toBe(true);
    });
  });

  describe('POSTPARTUM', () => {
    const participantType: ParticipantType = 'POSTPARTUM';

    it('should allow all food categories', () => {
      expect(checkEligibility('milk', 'milk', participantType).eligible).toBe(true);
      expect(checkEligibility('fish', 'fish', participantType).eligible).toBe(true);
    });

    it('should not allow infant food', () => {
      const result = checkEligibility('infant', 'baby food', participantType);
      expect(result.eligible).toBe(false);
    });
  });

  describe('unknown participant type', () => {
    it('should return eligible for unknown participant type', () => {
      const result = checkEligibility('milk', 'whole milk', 'UNKNOWN' as ParticipantType);
      expect(result.eligible).toBe(true);
    });
  });
});

describe('getParticipantBenefits', () => {
  it('should return benefits for INFANT_6_12', () => {
    const benefits = getParticipantBenefits('INFANT_6_12');
    expect(benefits).toHaveLength(1);
    expect(benefits[0].category).toBe('produce');
    expect(benefits[0].cashValueOunces).toBe(8);
  });

  it('should return benefits for CHILD_1_2', () => {
    const benefits = getParticipantBenefits('CHILD_1_2');
    expect(benefits).toHaveLength(1);
    expect(benefits[0].category).toBe('produce');
    expect(benefits[0].cashValueOunces).toBe(26);
  });

  it('should return benefits for CHILD_2_5', () => {
    const benefits = getParticipantBenefits('CHILD_2_5');
    expect(benefits).toHaveLength(1);
    expect(benefits[0].category).toBe('produce');
    expect(benefits[0].cashValueOunces).toBe(26);
  });

  it('should return benefits for BREASTFEEDING with higher fish allocation', () => {
    const benefits = getParticipantBenefits('BREASTFEEDING');
    const fishBenefit = benefits.find(b => b.category === 'canned fish');
    expect(fishBenefit?.allowedOunces).toBe(20);
  });

  it('should return empty array for unknown participant type', () => {
    const benefits = getParticipantBenefits('UNKNOWN' as ParticipantType);
    expect(benefits).toHaveLength(0);
  });
});

describe('PARTICIPANT_LABELS', () => {
  it('should have correct labels for all participant types', () => {
    expect(PARTICIPANT_LABELS.INFANT_0_6).toBe('Infant (0-6 months)');
    expect(PARTICIPANT_LABELS.INFANT_6_12).toBe('Infant (6-12 months)');
    expect(PARTICIPANT_LABELS.CHILD_1_2).toBe('Child (1-2 years)');
    expect(PARTICIPANT_LABELS.CHILD_2_5).toBe('Child (2-5 years)');
    expect(PARTICIPANT_LABELS.PREGNANT).toBe('Pregnant Woman');
    expect(PARTICIPANT_LABELS.PARTIALLY_BREASTFEEDING).toBe('Partially Breastfeeding');
    expect(PARTICIPANT_LABELS.BREASTFEEDING).toBe('Fully Breastfeeding');
    expect(PARTICIPANT_LABELS.POSTPARTUM).toBe('Postpartum (Not Breastfeeding)');
  });
});
