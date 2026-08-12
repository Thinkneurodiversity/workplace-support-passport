"use client";

import styles from "./passport.module.css";
import type { PassportField } from "@/lib/passport-content";

type Value = string | string[];
type ChangeOpts = { saveImmediately?: boolean };

interface Props {
  field: PassportField;
  value: Value | undefined;
  onChange: (key: string, value: Value, opts?: ChangeOpts) => void;
  onBlur: (key: string) => void;
}

/** Renders one question from passport-content.ts. Text/email/textarea use
 * a plain <label for>; checkbox-group and radio-group use <fieldset>/
 * <legend> instead, since a <label> can't be programmatically associated
 * with more than one control, per fomr.io/blog/accessible-form-design.
 * Conditional follow-ups (field.conditional set) render in the muted
 * `.conditional` treatment rather than the plain `.field` spacing, same
 * visual language as reference-prototype.html's `.conditional.visible`. */
export default function FieldRenderer({ field, value, onChange, onBlur }: Props) {
  const hintId = field.hint ? `${field.key}-hint` : undefined;
  const wrapperClassName = field.conditional ? styles.conditional : styles.field;

  if (field.type === "checkbox-group" || field.type === "radio-group") {
    return (
      <fieldset className={`${styles.fieldsetReset} ${wrapperClassName}`} aria-describedby={hintId}>
        {field.label && (
          <legend className={styles.legend}>
            {field.label}
            {field.optionalTag && <span className={styles.optionalTag}>{field.optionalTag}</span>}
          </legend>
        )}
        {field.hint && (
          <div className={styles.fieldHint} id={hintId}>
            {field.hint}
          </div>
        )}
        {field.type === "checkbox-group" ? (
          <CheckboxGroup field={field} value={value} onChange={onChange} />
        ) : (
          <RadioGroup field={field} value={value} onChange={onChange} />
        )}
      </fieldset>
    );
  }

  return (
    <div className={wrapperClassName}>
      {field.label && (
        <label htmlFor={field.key} className={styles.label}>
          {field.label}
          {field.optionalTag && <span className={styles.optionalTag}>{field.optionalTag}</span>}
        </label>
      )}
      {field.hint && (
        <div className={styles.fieldHint} id={hintId}>
          {field.hint}
        </div>
      )}
      {field.type === "textarea" ? (
        <textarea
          id={field.key}
          className={styles.textArea}
          placeholder={field.placeholder}
          aria-describedby={hintId}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(field.key, e.target.value)}
          onBlur={() => onBlur(field.key)}
        />
      ) : (
        <input
          type={field.type}
          id={field.key}
          className={styles.textInput}
          placeholder={field.placeholder}
          aria-describedby={hintId}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(field.key, e.target.value)}
          onBlur={() => onBlur(field.key)}
        />
      )}
    </div>
  );
}

function CheckboxGroup({
  field,
  value,
  onChange,
}: {
  field: PassportField;
  value: Value | undefined;
  onChange: (key: string, value: Value, opts?: ChangeOpts) => void;
}) {
  const selected = Array.isArray(value) ? value : [];

  return (
    <div className={styles.checkGroup}>
      {field.options?.map((opt) => {
        const checked = selected.includes(opt.value);
        const className = [styles.checkItem, checked && styles.checkItemChecked, opt.isNoneOption && styles.noneItem]
          .filter(Boolean)
          .join(" ");
        return (
          <label key={opt.value} className={className}>
            <input
              type="checkbox"
              name={field.key}
              checked={checked}
              onChange={(e) => {
                const next = e.target.checked ? [...selected, opt.value] : selected.filter((v) => v !== opt.value);
                onChange(field.key, next, { saveImmediately: true });
              }}
            />
            {opt.label}
          </label>
        );
      })}
    </div>
  );
}

function RadioGroup({
  field,
  value,
  onChange,
}: {
  field: PassportField;
  value: Value | undefined;
  onChange: (key: string, value: Value, opts?: ChangeOpts) => void;
}) {
  return (
    <div className={styles.radioGroup}>
      {field.options?.map((opt) => {
        const checked = value === opt.value;
        const className = [styles.radioItem, checked && styles.radioItemSelected].filter(Boolean).join(" ");
        return (
          <label key={opt.value} className={className}>
            <input
              type="radio"
              name={field.key}
              checked={checked}
              onChange={() => onChange(field.key, opt.value, { saveImmediately: true })}
            />
            {opt.label}
          </label>
        );
      })}
    </div>
  );
}
