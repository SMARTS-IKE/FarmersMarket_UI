import { useMemo, useState, useEffect } from 'react';
import { Box, Paper, Typography, Grid, Alert } from '@mui/material';
import { useNavigate, useParams } from '@tanstack/react-router';
import CustomInputField from '../../../shared/components/CustomInputField';
import CustomButton from '../../../shared/components/CustomButton';
import type { FeeRule } from '../../../models/fee';
import { useMarketsQuery } from '../../../queries/marketQueries';
import { SELLER_TYPE_LABELS } from '../../../lib/feeUtils';
import { useFeeRuleQuery, useUpdateFeeRuleMutation } from '../../../queries/feesQueries';

export default function FeeEditPage() {
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const feeId = params['feeRuleId'] ?? params['id'] ?? params['feeId'] ?? '';

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [fee, setFee] = useState<FeeRule>({
    name: '',
    description: '',
    marketId: 0,
    sellerType: '',
    licenseCategory: '',
    amount: 0,
    basis: 0,
    validFrom: '',
    validTo: '',
    priority: 0,
    legalReference: '',
  });

  const { data: marketsData } = useMarketsQuery({ name: '', marketType: '' as const, operatingDays: [], page: 1, pageSize: 1000 });
  const markets = marketsData?.items ?? [];

  const marketOptions = useMemo(() => markets.map((m) => ({ label: m.name, value: String(m.id) })), [markets]);
  const sellerTypeOptions = useMemo(() => Object.entries(SELLER_TYPE_LABELS).map(([value, label]) => ({ label, value })), []);

  const { data: fetchedFee, isLoading } = useFeeRuleQuery(feeId as string | number | undefined);
  const updateMutation = useUpdateFeeRuleMutation();

  useEffect(() => {
    if (!fetchedFee) return;
    setFee({
      name: fetchedFee.name ?? '',
      description: fetchedFee.description ?? '',
      marketId: typeof fetchedFee.marketId === 'number' ? fetchedFee.marketId : Number(fetchedFee.marketId ?? 0),
      sellerType: fetchedFee.sellerType ?? '',
      licenseCategory: fetchedFee.licenseCategory ?? '',
      amount: fetchedFee.amount ?? 0,
      basis: fetchedFee.basis ?? 0,
      validFrom: fetchedFee.validFrom ?? '',
      validTo: fetchedFee.validTo ?? '',
      priority: fetchedFee.priority ?? 0,
      legalReference: fetchedFee.legalReference ?? '',
    });
  }, [fetchedFee]);

  const handleChange = (key: keyof FeeRule, value: any) => {
    setFee((prev) => ({ ...prev, [key]: value } as FeeRule));
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);

    if (!fee.name || !fee.marketId || !fee.validFrom || !fee.validTo) {
      setError('Παρακαλώ συμπληρώστε όλα τα υποχρεωτικά πεδία.');
      return;
    }

    try {
      await updateMutation.mutateAsync({ id: feeId as any, payload: fee });
      setSuccess('Το τέλος ενημερώθηκε επιτυχώς.');
      navigate({ to: '/admin/fees-payments' } as any);
    } catch (e: any) {
      setError(e?.message ?? 'Σφάλμα κατά την ενημέρωση.');
    }
  };

  return (
    <div className="flex h-full w-full items-start">
      <Paper sx={{ width: '100%', p: 4 }}>
        <Typography variant="h6" gutterBottom>Επεξεργασία Τέλους</Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <CustomInputField
              label="Όνομα"
              value={fee.name}
              onChange={(v) => handleChange('name', String(v))}
              validation={{ required: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <CustomInputField
              type="DROPDOWN"
              label="Αγορά"
              dropdownItems={marketOptions.map((m) => ({ label: m.label, value: m.value }))}
              value={fee.marketId ? String(fee.marketId) : ''}
              onChange={(v) => handleChange('marketId', Number(v))}
              validation={{ required: true }}
            />
          </Grid>

          <Grid item xs={12}>
            <CustomInputField
              type="TEXTAREA"
              label="Περιγραφή"
              value={fee.description}
              onChange={(v) => handleChange('description', String(v))}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <CustomInputField
              type="DROPDOWN"
              label="Τύπος Πωλητή"
              dropdownItems={sellerTypeOptions.map((s) => ({ label: s.label, value: s.value }))}
              value={fee.sellerType}
              onChange={(v) => handleChange('sellerType', String(v))}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <CustomInputField
              label="Κατηγορία Άδειας"
              value={fee.licenseCategory}
              onChange={(v) => handleChange('licenseCategory', String(v))}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <CustomInputField
              type="NUMBER"
              label="Ποσό"
              value={fee.amount}
              onChange={(v) => handleChange('amount', Number(v))}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <CustomInputField
              type="NUMBER"
              label="Βάση"
              value={fee.basis}
              onChange={(v) => handleChange('basis', Number(v))}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <CustomInputField
              type="DATE"
              label="Ισχύει από"
              value={fee.validFrom}
              onChange={(v) => handleChange('validFrom', String(v))}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <CustomInputField
              type="DATE"
              label="Ισχύει έως"
              value={fee.validTo}
              onChange={(v) => handleChange('validTo', String(v))}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <CustomInputField
              type="NUMBER"
              label="Προτεραιότητα"
              value={fee.priority}
              onChange={(v) => handleChange('priority', Number(v))}
            />
          </Grid>

          <Grid item xs={12}>
            <CustomInputField
              label="Νομική Αναφορά"
              value={fee.legalReference}
              onChange={(v) => handleChange('legalReference', String(v))}
            />
          </Grid>

          <Grid item xs={12} sx={{ display: 'flex', gap: 2 }}>
            <CustomButton title="Αποθήκευση" onClick={handleSubmit} />
            <CustomButton title="Ακύρωση" backgroundColor="var(--color-text-muted)" onClick={() => navigate({ to: '/admin/fees-payments' } as any)} />
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
}
