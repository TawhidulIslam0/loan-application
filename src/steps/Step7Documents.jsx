import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import FileUpload from '../components/common/FileUpload';
import SignatureCanvas from '../components/common/SignatureCanvas';

function DocumentField({
  name,
  label,
  control,
  error,
  maxSizeMB = 5,
  accept = 'application/pdf,image/jpeg,image/png',
  required = true,
}) {
  return (
    <Controller
      name={name}
      control={control}
      rules={{
        required: required
          ? `${label.replace(' *', '')} is required`
          : false,
      }}
      render={({ field }) => (
        <FileUpload
          label={label}
          maxSizeMB={maxSizeMB}
          accept={accept}
          initialFile={field.value}
          onFileUploaded={field.onChange}
          error={error}
        />
      )}
    />
  );
}

export default function Step7Documents() {
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext();

  const panVerified = watch('panVerified');
  const loanType = watch('loanType');
  const employmentType = watch('employmentType');

  const salaried = employmentType === 'Salaried';
  const selfEmployed =
    employmentType === 'Self-Employed' ||
    employmentType === 'Business Owner';
  const homeLoan = loanType === 'Home';
  const businessLoan = loanType === 'Business';

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">
          Step 7: Document Upload & E-Signature
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Upload the required documents for your loan and employment profile.
        </p>
      </div>

      <div className="rounded-lg border bg-slate-50 p-4">
        <h3 className="font-semibold">Required Documents</h3>
        <ul className="mt-2 space-y-1 text-sm text-slate-600">
          <li>• PAN Card Copy</li>
          <li>• Aadhaar Card - Front & Back</li>
          <li>• Bank Statements - Last 6 months</li>
          <li>• Passport Size Photograph</li>
          {salaried && <li>• Salary Slips - Last 3 months</li>}
          {selfEmployed && <li>• ITR - Last 2 years</li>}
          {homeLoan && <li>• Property Documents</li>}
          {businessLoan && (
            <>
              <li>• Business Registration Certificate</li>
              <li>• GST Returns - Last 4 quarters</li>
            </>
          )}
          <li>• E-Signature</li>
        </ul>
      </div>

      <div className="space-y-4">
        <DocumentField
          name="panDocument"
          label={`PAN Card Copy ${panVerified ? '(Optional)' : '*'}`}
          control={control}
          error={errors.panDocument?.message}
          required={!panVerified}
        />

        <DocumentField
          name="aadhaarFrontFile"
          label="Aadhaar Card - Front *"
          control={control}
          error={errors.aadhaarFrontFile?.message}
        />

        <DocumentField
          name="aadhaarBackFile"
          label="Aadhaar Card - Back *"
          control={control}
          error={errors.aadhaarBackFile?.message}
        />

        <DocumentField
          name="bankStatementFile"
          label="Bank Statements (Last 6 months) *"
          control={control}
          error={errors.bankStatementFile?.message}
          maxSizeMB={10}
        />

        <DocumentField
          name="photoFile"
          label="Photograph (Passport size) *"
          control={control}
          error={errors.photoFile?.message}
          maxSizeMB={2}
          accept="image/jpeg,image/png"
        />

        {salaried && (
          <div className="space-y-3 rounded-lg border border-blue-100 bg-blue-50/50 p-4">
            <h3 className="font-semibold">Salary Slips - Last 3 Months</h3>
            {[1, 2, 3].map((month) => (
              <DocumentField
                key={month}
                name={`salarySlip${month}`}
                label={`Salary Slip - Month ${month} *`}
                control={control}
                error={errors[`salarySlip${month}`]?.message}
              />
            ))}
          </div>
        )}

        {selfEmployed && (
          <div className="space-y-3 rounded-lg border border-purple-100 bg-purple-50/50 p-4">
            <h3 className="font-semibold">ITR - Last 2 Years</h3>
            {[1, 2].map((year) => (
              <DocumentField
                key={year}
                name={`itrYear${year}`}
                label={`ITR - Year ${year} *`}
                control={control}
                error={errors[`itrYear${year}`]?.message}
                accept="application/pdf"
              />
            ))}
          </div>
        )}

        {homeLoan && (
          <div className="rounded-lg border border-amber-100 bg-amber-50/50 p-4">
            <DocumentField
              name="propertyDocFile"
              label="Property Documents *"
              control={control}
              error={errors.propertyDocFile?.message}
              maxSizeMB={10}
              accept="application/pdf"
            />
          </div>
        )}

        {businessLoan && (
          <div className="space-y-4 rounded-lg border border-green-100 bg-green-50/50 p-4">
            <h3 className="font-semibold">Business Documents</h3>

            <DocumentField
              name="businessRegFile"
              label="Business Registration Certificate *"
              control={control}
              error={errors.businessRegFile?.message}
              accept="application/pdf"
            />

            <div className="space-y-3">
              <h4 className="font-medium">GST Returns - Last 4 Quarters</h4>
              {[1, 2, 3, 4].map((quarter) => (
                <DocumentField
                  key={quarter}
                  name={`gstQuarter${quarter}`}
                  label={`GST Return - Quarter ${quarter} *`}
                  control={control}
                  error={errors[`gstQuarter${quarter}`]?.message}
                  accept="application/pdf"
                />
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-slate-200 pt-5">
          <Controller
            name="eSignature"
            control={control}
            rules={{ required: 'E-Signature is required' }}
            render={({ field }) => (
              <SignatureCanvas
                initialSignature={field.value}
                onSignatureChange={field.onChange}
                error={errors.eSignature?.message}
              />
            )}
          />
        </div>
      </div>
    </div>
  );
}

