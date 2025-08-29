'use client';

import React, { useMemo, useState } from 'react';
import {
  MorphingDialog,
  MorphingDialogTrigger,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogClose,
  MorphingDialogTitle,
  MorphingDialogDescription,
} from '@/components/motion-primitives/morphing-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { useCartStore } from '@/lib/stores/cart-store';
import { formatPriceWithSettings } from '@/lib/currency-utils';
import { useWebshopSettings } from '@/components/providers/webshop-settings-provider';
import { getCurrentShopId, placeOrder } from '@/api/webshop-api';
import toast from 'react-hot-toast';
import { t } from '@/lib/i18n';

type Step = 'cart' | 'checkout' | 'success';

export function CartButtonWithDialog({
  className,
}: {
  className?: string;
}) {
  const itemCount = useCartStore((s) => Object.values(s.items).reduce((sum, it) => sum + it.quantity, 0));

  return (
    <MorphingDialog>
      <MorphingDialogTrigger className={className}>
        <div className="relative">
          <Button asChild variant="ghost" size="sm" className="relative">
            <span className="relative inline-flex">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </span>
          </Button>
        </div>
      </MorphingDialogTrigger>
      <MorphingDialogContainer>
        <CartDialogContent />
      </MorphingDialogContainer>
    </MorphingDialog>
  );
}

function CartDialogContent() {
  const { settings, websitePaymentMethods } = useWebshopSettings();
  const itemsMap = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clear = useCartStore((s) => s.clear);

  const [step, setStep] = useState<Step>('cart');
  const [placing, setPlacing] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');

  const items = useMemo(() => Object.values(itemsMap), [itemsMap]);
  const subtotal = useMemo(() =>
    items.reduce((sum, it) => {
      const unit = typeof it.discountPrice === 'number' ? it.discountPrice! : it.price;
      return sum + unit * it.quantity;
    }, 0),
    [items]
  );
  const canProceedToCheckout = items.length > 0;
  const isCheckoutValid =
    name.trim() && phone.trim() && address.trim() && paymentMethod.trim();

  const orderItems = useMemo(
    () => items.map((it) => ({ productId: it.productId, quantity: it.quantity })),
    [items]
  );

  async function handlePlaceOrder() {
    if (!isCheckoutValid) return;
    setPlacing(true);
    try {
      const shopId = getCurrentShopId();
      await placeOrder({
        shopId,
        orderItems,
        userData: { name, phone, address, paymentMethod },
      });
      clear();
      setStep('success');
      toast.success(t('order_placed'));
    } catch (e) {
      // toast from axios interceptor will show message
    } finally {
      setPlacing(false);
    }
  }

  return (
    <MorphingDialogContent className="relative w-[96vw] max-w-2xl rounded-xl border border-border bg-card p-4 sm:p-6 shadow-xl">
      <MorphingDialogClose />
      <MorphingDialogTitle>
        <div className="mb-4 text-xl font-semibold">
          {step === 'cart' && t('cart_title')}
          {step === 'checkout' && t('checkout_title')}
          {step === 'success' && t('success_title')}
        </div>
      </MorphingDialogTitle>
      <MorphingDialogDescription className="space-y-5">
        {step === 'cart' && (
          <div className="space-y-4">
            {items.length === 0 ? (
              <div className="text-muted-foreground">{t('cart_empty')}</div>
            ) : (
              <div className="space-y-3">
                {items.map((it) => {
                  const unit = typeof it.discountPrice === 'number' ? it.discountPrice! : it.price;
                  const lineTotal = unit * it.quantity;
                  return (
                    <div key={it.productId} className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-md border border-border p-3">
                      {it.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={it.imageUrl} alt={it.productName} className="h-14 w-14 rounded object-cover" />
                      ) : (
                        <div className="h-14 w-14 rounded bg-muted" />
                      )}
                      <div className="flex-1">
                        <div className="font-medium text-sm sm:text-base">{it.productName}</div>
                        {it.attributes && (
                          <div className="text-xs text-muted-foreground">
                            {Object.entries(it.attributes)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(', ')}
                          </div>
                        )}
                        <div className="mt-1 flex items-center gap-2 text-sm">
                          {typeof it.discountPrice === 'number' ? (
                            <>
                              <span className="font-semibold">{formatPriceWithSettings(it.discountPrice, settings)}</span>
                              <span className="text-muted-foreground line-through">{formatPriceWithSettings(it.price, settings)}</span>
                            </>
                          ) : (
                            <span className="font-semibold">{formatPriceWithSettings(it.price, settings)}</span>
                          )}
                        </div>
                      </div>
                      <div className="mt-1 flex w-full items-center justify-between gap-3 sm:mt-0 sm:w-auto sm:justify-end sm:gap-4">
                        <div className="flex items-center gap-2">
                          <button className="h-9 w-9 sm:h-8 sm:w-8 rounded border" aria-label="Decrease quantity" onClick={() => updateQuantity(it.productId, Math.max(1, it.quantity - 1))}>−</button>
                          <span className="min-w-[28px] text-center">{it.quantity}</span>
                          <button className="h-9 w-9 sm:h-8 sm:w-8 rounded border" aria-label="Increase quantity" onClick={() => updateQuantity(it.productId, it.quantity + 1)}>+</button>
                        </div>
                        <div className="text-right font-semibold sm:w-28">
                          {formatPriceWithSettings(lineTotal, settings)}
                        </div>
                        <button className="rounded p-2 hover:bg-muted" onClick={() => removeItem(it.productId)} aria-label={t('delete_item')}>
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex items-center justify-between border-t pt-4">
              <div className="text-sm text-muted-foreground">{t('total_short')}</div>
              <div className="text-lg font-bold">{formatPriceWithSettings(subtotal, settings)}</div>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
              <Button className="w-full sm:w-auto" variant="outline" onClick={() => clear()} disabled={items.length === 0}>{t('clear')}</Button>
              <Button className="w-full sm:w-auto" onClick={() => setStep('checkout')} disabled={!canProceedToCheckout}>{t('proceed_to_checkout')}</Button>
            </div>
          </div>
        )}

        {step === 'checkout' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="mb-1 block text-sm">{t('name_label')}</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('name_label')} required />
              </div>
              <div>
                <label className="mb-1 block text-sm">{t('phone_label')}</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+998 ..." required />
              </div>
              <div>
                <label className="mb-1 block text-sm">{t('address_label')}</label>
                <Textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder={t('address_label')} required />
              </div>
              <div>
                <div className="mb-1 text-sm">{t('payment_method')}</div>
                <div className="space-y-2">
                  {websitePaymentMethods.map((pm) => (
                    <label key={pm.name} className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={pm.name}
                        checked={paymentMethod === pm.name}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <span>{pm.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <div className="text-sm text-muted-foreground">{t('to_pay')}</div>
              <div className="text-lg font-bold">{formatPriceWithSettings(subtotal, settings)}</div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep('cart')}>{t('back_btn')}</Button>
              <Button onClick={handlePlaceOrder} disabled={!isCheckoutValid || placing}>
                {placing ? t('placing_order') : t('place_order')}
              </Button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="space-y-3 py-6 text-center">
            <div className="text-lg font-semibold">{t('order_placed')}</div>
            <div className="text-muted-foreground">{t('we_will_contact_you')}</div>
            <div className="pt-2">
              <Button onClick={() => setStep('cart')}>{t('return_to_shopping')}</Button>
            </div>
          </div>
        )}
      </MorphingDialogDescription>
    </MorphingDialogContent>
  );
}


