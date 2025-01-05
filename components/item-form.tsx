import React from 'react';
import { useForm } from 'react-hook-form';
import { validate } from 'class-validator';
import { Name } from '@/lib/domain/Name';

interface FormData {
  name: string;
}

interface ItemFormProps {
  itemId: string;
  initialName: string;
  onSubmit: (itemId: string, newName: string) => Promise<void>;
}

const ItemForm: React.FC<ItemFormProps> = ({ itemId, initialName, onSubmit }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      name: initialName
    }
  });

  const validateName = async (value: string) => {
    try {
      const name = Name.create(value);
      const validationErrors = await validate(name);

      if (validationErrors.length > 0) {
        return validationErrors[0].constraints?.[Object.keys(validationErrors[0].constraints)[0]];
      }
      return true;
    } catch (err) {
      if (err instanceof Error) {
        return err.message;
      }
      return 'An error occurred during validation';
    }
  };

  const handleFormSubmit = async (data: FormData) => {
    if (data.name !== initialName) {
      try {
        await onSubmit(itemId, data.name);
      } catch (err) {
        console.error('Failed to update item:', err);
      }
    }
  };

  return (
    <div className="mb-4">
      <input 
        id="name" 
        className="w-full rounded-md border px-3 py-2"
        {...register('name', {
          validate: validateName,
          onBlur: () => handleSubmit(handleFormSubmit)()
        })}
      />
      {errors.name && <span className="text-red-500 text-sm mt-1 block">{errors.name.message}</span>}
    </div>
  );
};

export default ItemForm; 