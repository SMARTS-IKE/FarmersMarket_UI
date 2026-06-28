import { useMemo, useState } from 'react';
import { Box, Paper, Typography, Alert, Snackbar } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';
import CustomInputField from '../../../shared/components/CustomInputField';
import CustomButton from '../../../shared/components/CustomButton';
import type { FeeRule } from '../../../models/fee';
import { useMarketsQuery } from '../../../queries/marketQueries';
import { SELLER_TYPE_LABELS } from '../../../lib/feeUtils';
import { useCreateFeeRuleMutation } from '../../../queries/feesQueries';

export default function FeeCreationPage() {
  const navigate = useNavigate();

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [fee, setFee] = useState<FeeRule>({
    name: '',
    description: '',
    marketId: null,
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

  const marketOptions = useMemo(() => markets.map((m) => ({ label: m.name, value: m.id })), [markets]);
  const sellerTypeOptions = useMemo(() => Object.entries(SELLER_TYPE_LABELS).map(([value, label]) => ({ label, value })), []);

  const createMutation = useCreateFeeRuleMutation();

  const handleChange = (key: keyof FeeRule, value: any) => {
    setFee((prev) => ({ ...prev, [key]: value } as FeeRule));
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);

    if (!fee.name || fee.marketId == null || !fee.validFrom || !fee.validTo) {
      setError('Παρακαλώ συμπληρώστε όλα τα υποχρεωτικά πεδία.');
      return;
    }

    try {
      await createMutation.mutateAsync(fee);
      setSuccess('Το τέλος δημιουργήθηκε επιτυχώς.');
      navigate({ to: '/admin/fees-payments' } as any);
    } catch (e: any) {
      setError(e?.message ?? 'Σφάλμα κατά τη δημιουργία.');
    }
  };

  return (
      <div className="flex h-full flex-col w-full items-start">
          <Paper className="flex h-full flex-col items-start gap-6" sx={{ width: { xs: '100%', md: '80%' }, p: 4, bgcolor: 'transparent', boxShadow: 'none', mx: 'auto' }}>
                <Typography variant="h6" gutterBottom>Δημιουργία Τέλους</Typography>

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
                          type="DROPDOWN"
                          label="Αγορά"
                          dropdownItems={marketOptions.map((m) => ({ label: m.label, value: m.value }))}
                          value={fee.marketId ?? ''}
                          onChange={(v) => handleChange('marketId', (v === '' || v === undefined) ? null : Number(v))}
                          validation={{ required: true }}
                        />

                      <CustomInputField
                          width="100%"
                          type="DROPDOWN"
                          label="Τύπος Πωλητή"
                          value={fee.sellerType}
                          dropdownItems={sellerTypeOptions.map((s) => ({ label: s.label, value: s.value }))}
                          onChange={(v) => handleChange('sellerType', String(v))}
                      />
                  </div>
                </Box>

                <Box className="flex-row" sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, width: '100%' }}>
                  <div className="flex flex-row flex-1 gap-2" style={{ minWidth: '300px' }}>
                      <CustomInputField
                          width="100%"
                          type="NUMBER"
                          label="Ποσό"
                          value={fee.amount}
                          onChange={(v) => handleChange('amount', Number(v))}
                      />
                  </div>

                  <div className="flex flex-row flex-1 gap-2" style={{ minWidth: '300px' }}>
                      <CustomInputField
                          width="100%"
                          type="NUMBER"
                          label="Βάση"
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
                      />

                      <CustomInputField
                          width="100%"
                          type="DATE"
                          label="Ισχύει έως"
                          value={fee.validTo}
                          onChange={(v) => handleChange('validTo', String(v))}
                      />

                  </div>

                </Box>
                
                <Box className="flex-row" sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, width: '100%' }}>
                  <div className="flex flex-row flex-1 gap-2" style={{ minWidth: '300px' }}>
                      <CustomInputField
                          width="100%"
                          type="NUMBER"
                          label="Προτεραιότητα"
                          value={fee.priority}
                          onChange={(v) => handleChange('priority', Number(v))}
                      />


                      <CustomInputField
                          type="TEXT"
                          width="100%"
                          label="Νομική Αναφορά"
                          value={fee.legalReference || ''}
                          onChange={(v) => handleChange('legalReference', String(v))}
                      />

                      {/* <CustomInputField
                          width="100%"
                          type="TEXTAREA"
                          label="Περιγραφή"
                          value={fee.description || ''}
                          onChange={(v) => handleChange('description', String(v))}
                      /> */}
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
              open={createMutation.isPending}
              message="Δημιουργία τέλους..."
          />
      </div>
  );
}
