# TanStack Form Composition - Room Listing Form

This document explains how we use TanStack Form's composition features to create a clean, modular multi-step form without prop drilling.

## Architecture

### 1. Form Hook Setup (`apps/web/src/components/form/`)

We've already set up the form composition infrastructure:

```tsx
// context.tsx
export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts()

// index.tsx
export const { useAppForm, withFieldGroup, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    Text,
    TextArea,
    Calendar,
    Slider,
    Select,
    Switch,
    Checkbox,
    RadioGroup,
    MultiSelect,
    OTP,
    TagInput,
  },
  formComponents: {},
});
```

### 2. Field Groups for Each Step

Each step is now a **field group** created with `withFieldGroup`. This provides:
- ✅ No need to pass `form` prop
- ✅ Automatic context access via `group` object
- ✅ Type-safe field mapping
- ✅ Reusable components

#### Example: Step1BasicInfo

```tsx
import { withFieldGroup } from "@web/components/form";
import { useStore } from "@tanstack/react-form";

type Step1Fields = {
  name: string;
  description: string;
};

export const Step1BasicInfo = withFieldGroup({
  defaultValues: {
    name: "",
    description: "",
  },
  props: {
    onNext: () => {},
  },
  render: function Render({ group, onNext }) {
    // Access form state via group.useStore
    const name = useStore(group.store, (state) => state.values.name);

    return (
      <div>
        {/* Use group.AppField instead of form.Field */}
        <group.AppField
          name="name"
          validators={{
            onChange: z.string().min(1, "Required"),
          }}
        >
          {(field) => (
            <field.Text
              label="Title"
              placeholder="Enter title"
            />
          )}
        </group.AppField>
      </div>
    );
  },
});
```

### 3. Main Form Component

The main `RoomListingForm` uses `useAppForm` and passes field groups with the `fields` prop:

```tsx
import { useAppForm } from "@web/components/form";
import { Step1BasicInfo } from "./steps/Step1BasicInfo";

export function RoomListingForm() {
  const form = useAppForm({
    defaultValues: {
      name: "",
      description: "",
      // ... other fields
    },
    validators: {
      onSubmit: roomListingSchema,
    },
    onSubmit: async ({ value }) => {
      // Handle submission
    },
  });

  return (
    <form.AppForm>
      {step === 1 && (
        <Step1BasicInfo
          form={form}
          fields={{
            name: "name",
            description: "description",
          }}
          onNext={handleNext}
        />
      )}
    </form.AppForm>
  );
}
```

## Benefits

### 1. No Prop Drilling
- ❌ Before: `<Step1BasicInfo form={form} onNext={handleNext} />`
- ✅ After: Field group automatically accesses form context

### 2. Type Safety
- Field groups are typed with their specific fields
- TypeScript ensures correct field mapping

### 3. Reusability
- Field groups can be reused across different forms
- Just map the fields differently with the `fields` prop

### 4. Clean Component API
```tsx
// Field group only needs its specific props
<Step1BasicInfo
  form={form}
  fields={{ name: "name", description: "description" }}
  onNext={handleNext}
/>
```

### 5. Built-in Field Components
Field groups have access to all registered field components:
- `field.Text` - Text input with label, description, errors
- `field.TextArea` - Textarea with validation
- `field.Select` - Select dropdown
- `field.Switch` - Toggle switch
- And more...

## Migration Plan

To convert remaining steps:

1. **Step 2 (Amenities)**: Create `Step2Amenities` field group
2. **Step 3 (Address)**: Create `Step3Address` field group
3. **Step 4 (Photos)**: Create `Step4Photos` field group
4. **Step 5 (Pricing)**: Create `Step5Pricing` field group
5. **Step 6 (Review)**: Keep as regular component (read-only)

## Key Concepts

### `group` vs `form`
- `group`: Scoped to specific fields in the field group
- `group.form`: Access to the entire form if needed
- `group.useStore()`: Subscribe to group-specific state
- `group.AppField`: Create fields within the group

### Field Mapping
```tsx
// Top-level fields
fields={{ name: "name", description: "description" }}

// Nested fields
fields="account_data"

// Array fields
fields={`linked_accounts[${i}]`}
```

### Validation
- Field-level: In `group.AppField` validators
- Group-level: Cross-field validation in render function
- Form-level: In `useAppForm` validators

## Resources

- [TanStack Form Composition Guide](https://tanstack.com/form/latest/docs/framework/react/guides/form-composition)
- [withFieldGroup API](https://tanstack.com/form/latest/docs/framework/react/reference/functions/withFieldGroup)
