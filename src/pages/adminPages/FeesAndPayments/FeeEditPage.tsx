import { useMemo, useState, useEffect } from 'react';
import { Box, Paper, Typography, Grid, Alert, Snackbar } from '@mui/material';
import { useNavigate, useParams } from '@tanstack/react-router';
import CustomInputField from '../../../shared/components/CustomInputField';
import CustomButton from '../../../shared/components/CustomButton';
import type { FeeRule } from '../../../models/fee';
import { useMarketsQuery } from '../../../queries/marketQueries';
import { SELLER_TYPE_LABELS, FEE_TYPE_OPTIONS } from '../../../lib/feeUtils';
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
    marketId: null,
    marketIds: [],
    feeType: '',
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

  // Debug: log markets response to help diagnose visibility issues
  // eslint-disable-next-line no-console
  console.debug('FeeEditPage markets:', marketsData);

  const marketOptions = useMemo(() => markets.map((m) => ({ label: m.name, value: m.id })), [markets]);
  const sellerTypeOptions = useMemo(() => Object.entries(SELLER_TYPE_LABELS).map(([value, label]) => ({ label, value })), []);
  const feeTypeOptions = useMemo(() => FEE_TYPE_OPTIONS.map((f) => ({ label: f.label, value: f.value })), []);

  const { data: fetchedFee, isLoading } = useFeeRuleQuery(feeId as string | number | undefined);
  const updateMutation = useUpdateFeeRuleMutation();

  useEffect(() => {
    if (!fetchedFee) return;
    setFee({
      name: fetchedFee.name ?? '',
      description: fetchedFee.description ?? '',
      marketId: typeof fetchedFee.marketId === 'number' ? fetchedFee.marketId : (fetchedFee.marketId ? Number(fetchedFee.marketId) : null),
      marketIds: Array.isArray(fetchedFee.marketIds) && fetchedFee.marketIds.length > 0
        ? fetchedFee.marketIds
        : fetchedFee.marketId ? [Number(fetchedFee.marketId)] : [],
      // Derive feeType from API flags if not present (some APIs return dailyFee/perMeterFee)
      feeType: fetchedFee.feeType ?? (
        (fetchedFee as any).dailyFee === 1 || (fetchedFee as any).dailyFee === true ? 'DAILY'
        : (fetchedFee as any).perMeterFee === 1 || (fetchedFee as any).perMeterFee === true ? 'PER_METER'
        : fetchedFee.feeType ?? ''
      ),
      sellerType: fetchedFee.sellerType ?? '',
      licenseCategory: fetchedFee.licenseCategory ?? '',
      amount: fetchedFee.amount ?? 0,
      basis: fetchedFee.basis ?? 0,
      // Support multiple possible date field names returned by the API
      validFrom: fetchedFee.validFrom ?? fetchedFee.createdAt ?? (fetchedFee as any).fromDate ?? '',
      validTo: fetchedFee.validTo ?? fetchedFee.updatedAt ?? (fetchedFee as any).toDate ?? '',
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

    if (!fee.name || (fee.marketIds?.length ?? 0) === 0 || !fee.validFrom || !fee.validTo) {
      setError('Παρακαλώ συμπληρώστε όλα τα υποχρεωτικά πεδία.');
      return;
    }

    try {
      const marketIds = (fee.marketIds && fee.marketIds.length > 0)
        ? fee.marketIds
        : fee.marketId ? [fee.marketId] : [];
      const apiPayload = {
        name: fee.name,
        description: fee.description,
        marketIds,
        sellerType: String(fee.sellerType ?? ''),
        licenseCategory: String(fee.sellerType ?? ''),
        dailyFee: fee.feeType === 'DAILY' ? 1 : 0,
        perMeterFee: fee.feeType === 'PER_METER' ? 1 : 0,
        basis: Number(fee.basis ?? 0),
      };

      await updateMutation.mutateAsync({ id: feeId as any, payload: apiPayload });
      setSuccess('Το τέλος ενημερώθηκε επιτυχώς.');
      navigate({ to: '/admin/fees-payments' } as any);
    } catch (e: any) {
      setError(e?.message ?? 'Σφάλμα κατά την ενημέρωση.');
    }
  };

  return (
    <div className="flex h-full flex-col w-full items-start">
      <Paper className="flex h-full flex-col items-start gap-10" sx={{ width: { xs: '100%', md: '90%' }, p: 4, bgcolor: 'transparent', boxShadow: 'none', mx: 'auto' }}>
            <Typography variant="h6" gutterBottom>Επεξεργασία Τέλους</Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <Box className="flex-row" sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, width: '100%' }}>
              <div className="flex flex-row flex-1 gap-2" style={{ minWidth: '300px' }}>
                  <CustomInputField
                      type="TEXT"
                      width="100%"
                      label="Τίτλος"
                      value={fee.name}
                      onChange={(v) => handleChange('name', String(v))}
                      validation={{ required: true }}
                  />

                    <CustomInputField
                        width="100%"
                        type="MULTI_SELECT"
                        label="Αγορά"
                        dropdownItems={marketOptions.map((m) => ({ label: m.label, value: String(m.value) }))}
                        value={(fee.marketIds ?? []).map(String)}
                        onChange={(v) => handleChange('marketIds', (Array.isArray(v) ? v.map((x) => Number(x)) : []))}
                        validation={{ required: true }}
                    />
              
              </div>
            </Box>

            <Box className="flex-row" sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, width: '100%' }}>
              <div className="flex flex-row flex-1 gap-2" style={{ minWidth: '300px' }}>
                <CustomInputField
                  width="100%"
                  type="DROPDOWN"
                  label="Τύπος Τέλους"
                  value={fee.feeType}
                  dropdownItems={feeTypeOptions.map((s) => ({ label: s.label, value: s.value }))}
                  onChange={(v) => handleChange('feeType', String(v))}
                  />
                <CustomInputField
                  width="100%"
                  type="DROPDOWN"
                  label="Τύπος Πωλητή"
                  value={fee.sellerType}
                  dropdownItems={sellerTypeOptions.map((s) => ({ label: s.label, value: s.value }))}
                  onChange={(v) => handleChange('sellerType', String(v))}
                />
                  <CustomInputField
                      width="100%"
                      type="NUMBER"
                      label="Ποσό €"
                      value={fee.basis}
                      onChange={(v) => handleChange('basis', Number(v))}
                  />
              </div>
            </Box>
            
            <Box className="flex-row" sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, width: '100%' }}>
              <div className="flex flex-row flex-1 gap-2" style={{ minWidth: '300px' }}>
                <CustomInputField
                  width="100%"
                  type="DATE"
                  label="Ισχύει από"
                  value={fee.validFrom}
                  onChange={(v) => handleChange('validFrom', String(v))}
                  validation={{ required: true }}
                />
                <CustomInputField
                  width="100%"
                  type="DATE"
                  label="Ισχύει έως"
                  value={fee.validTo}
                  onChange={(v) => handleChange('validTo', String(v))}
                  validation={{ required: true }}
                />
              </div>
            </Box>
            
          
            <Box className="flex-row" sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, width: '100%', justifyContent: 'space-between', mt: 2 }}>
                 <CustomInputField
                      width="71%"
                      type="TEXTAREA"
                      label="Περιγραφή"
                      value={fee.description || ''}
                      onChange={(v) => handleChange('description', String(v))}
                  />
                <div className="flex flex-row gap-2" >
                    <CustomButton title="Αποθήκευση" onClick={handleSubmit} />
                    <CustomButton title="Ακύρωση" backgroundColor="var(--color-text-muted)" onClick={() => navigate({ to: '/admin/fees-payments' } as any)} />
                </div>                 
            </Box>
      </Paper>

      <Snackbar
          open={updateMutation.isPending}
          message="Ενημέρωση τέλους..."
      />
  </div>
  );
}
