import { Stack, TextField, Typography, Button, Menu, MenuItem, Select, Grid, FormControl, Radio, Paper, IconButton, Box, useTheme, useMediaQuery, Divider, Alert, Container } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import React, { useEffect, useState } from 'react';
import { Cart } from '../../cart/components/Cart';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { addAddressAsync, selectAddressStatus, selectAddresses } from '../../address/AddressSlice';
import { selectLoggedInUser } from '../../auth/AuthSlice';
import { Link, useNavigate } from 'react-router-dom';
import { createOrderAsync, selectCurrentOrder, selectOrderStatus } from '../../order/OrderSlice';
import { resetCartByUserIdAsync, selectCartItems } from '../../cart/CartSlice';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { SHIPPING, TAXES } from '../../../constants';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import axios from 'axios';
import { formatPrice } from '../../../utils/formatPrice';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import PaymentIcon from '@mui/icons-material/Payment';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const PriceDetail = ({ label, value, type = "regular" }) => (
  <Stack 
    direction="row" 
    justifyContent="space-between" 
    alignItems="center"
    sx={{ 
      py: type === "total" ? 2 : 1,
      borderTop: type === "total" ? 1 : 0,
      borderColor: 'divider'
    }}
  >
    <Typography 
      color={type === "discount" ? "success.main" : "text.secondary"}
      variant={type === "total" ? "subtitle1" : "body2"}
      fontWeight={type === "total" ? 600 : 400}
    >
      {label}
    </Typography>
    <Typography 
      variant={type === "total" ? "h6" : "body2"}
      color={type === "discount" ? "success.main" : type === "total" ? "primary.main" : "text.primary"}
      fontWeight={type === "total" ? 600 : 400}
    >
      {type === "discount" ? "-" : ""}{formatPrice(value)}
    </Typography>
  </Stack>
);

const OrderSummaryCard = ({ cartItem }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2,
      mb: 1,
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 1,
      '&:hover': { bgcolor: 'grey.50' }
    }}
  >
    <Stack direction="row" spacing={2}>
      <Box
        component="img"
        src={cartItem.product.images[0]}
        alt={cartItem.product.title}
        sx={{
          width: 60,
          height: 60,
          borderRadius: 1,
          objectFit: 'cover'
        }}
      />
      <Stack flex={1} justifyContent="space-between">
        <Typography variant="subtitle2" noWrap>
          {cartItem.product.title}
        </Typography>
        <Stack 
          direction="row" 
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="body2" color="text.secondary">
            Qty: {cartItem.quantity} × {formatPrice(cartItem.product.price)}
          </Typography>
          <Typography variant="subtitle2" color="primary.main">
            {formatPrice(cartItem.product.price * cartItem.quantity)}
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  </Paper>
);

export const OrderSummarySection = ({ 
  orderTotal,
  cartItems,
  couponCode,
  setCouponCode,
  handleApplyCoupon,
  appliedCoupon,
  couponError,
  calculateDiscount,
  orderStatus,
  handleCreateOrder,
  selectedPaymentMethod
}) => {
  const finalAmount = orderTotal + SHIPPING + TAXES - (appliedCoupon ? calculateDiscount(appliedCoupon) : 0);

  return (
    <Paper 
      elevation={0}
      sx={{
        p: { xs: 2, md: 3 },
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        position: 'sticky',
        top: 24,
        maxHeight: 'calc(100vh - 48px)',
        overflow: 'auto'
      }}
    >
      <Stack spacing={3}>
        {/* Header */}
        <Stack 
          direction="row" 
          alignItems="center" 
          spacing={1}
          sx={{
            position: 'sticky',
            top: 0,
            bgcolor: 'background.paper',
            pb: 2,
            borderBottom: 1,
            borderColor: 'divider',
            zIndex: 1
          }}
        >
          <ShoppingBagIcon color="primary" />
          <Typography variant="h6" fontWeight={600}>
            Order Summary ({cartItems.length} items)
          </Typography>
        </Stack>

        {/* Order Items */}
        <Stack 
          spacing={1}
          sx={{
            maxHeight: '30vh',
            overflowY: 'auto',
            pr: 1,
            '&::-webkit-scrollbar': {
              width: 6,
              borderRadius: 10
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'grey.300',
              borderRadius: 10
            }
          }}
        >
          {cartItems.map(item => (
            <OrderSummaryCard key={item.product._id} cartItem={item} />
          ))}
        </Stack>

        {/* Coupon Section */}
        <Paper 
          variant="outlined" 
          sx={{ 
            p: 2,
            bgcolor: 'grey.50',
            borderStyle: 'dashed'
          }}
        >
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <LocalOfferIcon color="primary" fontSize="small" />
              <Typography variant="subtitle2" fontWeight={500}>
                Apply Coupon
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1}>
              <TextField
                fullWidth
                size="small"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Enter code"
                error={!!couponError}
                helperText={couponError}
                sx={{ bgcolor: 'white' }}
              />
              <LoadingButton
                variant="contained"
                onClick={handleApplyCoupon}
                disabled={!couponCode}
                sx={{ minWidth: '80px' }}
              >
                Apply
              </LoadingButton>
            </Stack>
          </Stack>
        </Paper>

        {/* Price Breakdown */}
        <Stack 
          spacing={2}
          sx={{
            py: 2,
            borderTop: 1,
            borderBottom: 1,
            borderColor: 'divider'
          }}
        >
          <PriceDetail label="Subtotal" value={orderTotal} />
          <PriceDetail label="Shipping" value={SHIPPING} />
          <PriceDetail label="Tax" value={TAXES} />
          
          {appliedCoupon && (
            <PriceDetail 
              label={`Discount (${appliedCoupon.code})`}
              value={calculateDiscount(appliedCoupon)}
              type="discount"
            />
          )}
        </Stack>

        {/* Final Amount */}
        <Stack 
          direction="row" 
          justifyContent="space-between" 
          alignItems="center"
          sx={{
            p: 2,
            bgcolor: 'primary.light',
            borderRadius: 1,
            color: 'white'
          }}
        >
          <Typography variant="h6">
            Total Amount
          </Typography>
          <Typography variant="h5" fontWeight={600}>
            ₹{formatPrice(finalAmount)}
          </Typography>
        </Stack>

        {/* Place Order Button */}
        <LoadingButton
          fullWidth
          size="large"
          variant="contained"
          loading={orderStatus === 'pending'}
          onClick={handleCreateOrder}
          sx={{
            py: 2,
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 16px rgba(0,0,0,0.12)'
            },
            transition: 'all 0.2s ease'
          }}
        >
          {selectedPaymentMethod === 'CARD' ? 'Proceed to Payment' : 'Place Order'}
        </LoadingButton>
      </Stack>
    </Paper>
  );
};

export const Checkout = () => {
  const status = '';
  const addresses = useSelector(selectAddresses);
  const [selectedAddress, setSelectedAddress] = useState(addresses[0]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash');
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();
  const dispatch = useDispatch();
  const loggedInUser = useSelector(selectLoggedInUser);
  const addressStatus = useSelector(selectAddressStatus);
  const navigate = useNavigate();
  const cartItems = useSelector(selectCartItems);
  const orderStatus = useSelector(selectOrderStatus);
  const currentOrder = useSelector(selectCurrentOrder);
  const orderTotal = cartItems.reduce((acc, item) => (item.product.price * item.quantity) + acc, 0);
  const theme = useTheme();
  const is900 = useMediaQuery(theme.breakpoints.down(900));
  const is480 = useMediaQuery(theme.breakpoints.down(480));
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  const calculateDiscount = (coupon) => {
    if (!coupon || !orderTotal) return 0;

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (orderTotal * coupon.discountValue) / 100;
      // Apply maximum discount limit if set
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else {
      // Fixed amount discount
      discount = Math.min(coupon.discountValue, orderTotal);
    }

    // Ensure discount doesn't exceed order total
    return Math.min(Math.round(discount), orderTotal);
  };

  useEffect(() => {
    if (addressStatus === 'fulfilled') {
      reset();
    } else if (addressStatus === 'rejected') {
      alert('Error adding your address');
    }
  }, [addressStatus]);

  useEffect(() => {
    if (currentOrder && currentOrder?._id) {
      dispatch(resetCartByUserIdAsync(loggedInUser?._id));
      navigate(`/order-success/${currentOrder?._id}`);
    }
  }, [currentOrder]);

  const handleAddAddress = (data) => {
    const address = { ...data, user: loggedInUser._id };
    dispatch(addAddressAsync(address));
  };

  const handleCreateOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address');
      return;
    }

    if (selectedPaymentMethod === 'CARD') {
      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        const options = {
          key: "rzp_live_kYGlb6Srm9dDRe", // Replace with your test key
          amount: (orderTotal + SHIPPING + TAXES) * 100, // Amount in paise
          currency: "INR",
          name: "Apex Store",
          description: "Order Payment",
          handler: function (response) {
            // On successful payment
            if (response.razorpay_payment_id) {
              // Create order after payment success
              const order = {
                user: loggedInUser._id,
                item: cartItems,
                address: selectedAddress,
                paymentMode: selectedPaymentMethod,
                total: orderTotal + SHIPPING + TAXES,
                paymentId: response.razorpay_payment_id
              };
              dispatch(createOrderAsync(order));
              toast.success('Payment Successful!');
            }
          },
          prefill: {
            name: loggedInUser?.name || '',
            email: loggedInUser?.email || '',
            contact: selectedAddress?.phoneNumber || ''
          },
          theme: {
            color: "#1976d2"
          }
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
      };
    } else {
      // Handle COD order
      const order = {
        user: loggedInUser._id,
        item: cartItems,
        address: selectedAddress,
        paymentMode: selectedPaymentMethod,
        total: orderTotal + SHIPPING + TAXES
      };
      dispatch(createOrderAsync(order));
    }
  };

  const handleApplyCoupon = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: couponCode, cartTotal: orderTotal }),
      });

      if (!response.ok) {
        throw new Error('Coupon validation failed');
      }

      const data = await response.json();
      if (data.valid) {
        setAppliedCoupon(data.coupon);
        setCouponError('');
        toast.success(`Coupon applied! You saved ₹${calculateDiscount(data.coupon)}`);
      } else {
        setCouponError('Invalid coupon');
        setAppliedCoupon(null);
      }
    } catch (error) {
      setCouponError(error.message || 'Invalid coupon');
      setAppliedCoupon(null);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Left Column - Shipping & Payment */}
        <Grid item xs={12} md={8}>
          <Stack rowGap={4}>

            {/* heading */}
            <Stack flexDirection={'row'} columnGap={is480 ? 0.3 : 1} alignItems={'center'}>
              <motion.div whileHover={{ x: -5 }}>
                <IconButton component={Link} to={"/cart"}><ArrowBackIcon fontSize={is480 ? "medium" : 'large'} /></IconButton>
              </motion.div>
              <Typography variant='h4'>Shipping Information</Typography>
            </Stack>

            {/* address form */}
            <Stack component={'form'} noValidate rowGap={2} onSubmit={handleSubmit(handleAddAddress)}>
              <Stack>
                <Typography gutterBottom>Type</Typography>
                <TextField placeholder='Eg. Home, Buisness' {...register("type", { required: true })} />
              </Stack>

              <Stack>
                <Typography gutterBottom>Street</Typography>
                <TextField {...register("street", { required: true })} />
              </Stack>

              <Stack>
                <Typography gutterBottom>Country</Typography>
                <TextField {...register("country", { required: true })} />
              </Stack>

              <Stack>
                <Typography gutterBottom>Phone Number</Typography>
                <TextField type='number' {...register("phoneNumber", { required: true })} />
              </Stack>

              <Stack flexDirection={'row'}>
                <Stack width={'100%'}>
                  <Typography gutterBottom>City</Typography>
                  <TextField  {...register("city", { required: true })} />
                </Stack>
                <Stack width={'100%'}>
                  <Typography gutterBottom>State</Typography>
                  <TextField  {...register("state", { required: true })} />
                </Stack>
                <Stack width={'100%'}>
                  <Typography gutterBottom>Postal Code</Typography>
                  <TextField type='number' {...register("postalCode", { required: true })} />
                </Stack>
              </Stack>

              <Stack flexDirection={'row'} alignSelf={'flex-end'} columnGap={1}>
                <LoadingButton loading={status === 'pending'} type='submit' variant='contained'>add</LoadingButton>
                <Button color='error' variant='outlined' onClick={() => reset()}>Reset</Button>
              </Stack>
            </Stack>

            {/* existing address */}
            <Stack rowGap={3}>

              <Stack>
                <Typography variant='h6'>Address</Typography>
                <Typography variant='body2' color={'text.secondary'}>Choose from existing Addresses</Typography>
              </Stack>

              <Grid container gap={2} width={is900 ? "auto" : '50rem'} justifyContent={'flex-start'} alignContent={'flex-start'}>
                {
                  addresses.map((address, index) => (
                    <FormControl item key={address._id}>
                      <Stack p={is480 ? 2 : 2} width={is480 ? '100%' : '20rem'} height={is480 ? 'auto' : '15rem'} rowGap={2} component={is480 ? Paper : Paper} elevation={1}>

                        <Stack flexDirection={'row'} alignItems={'center'}>
                          <Radio checked={selectedAddress === address} name='addressRadioGroup' value={selectedAddress} onChange={(e) => setSelectedAddress(addresses[index])} />
                          <Typography>{address.type}</Typography>
                        </Stack>

                        {/* details */}
                        <Stack>
                          <Typography>{address.street}</Typography>
                          <Typography>{address.state}, {address.city}, {address.country}, {address.postalCode}</Typography>
                          <Typography>{address.phoneNumber}</Typography>
                        </Stack>
                      </Stack>
                    </FormControl>
                  ))
                }
              </Grid>

            </Stack>

            {/* payment methods */}
            <Stack rowGap={3}>

              <Stack>
                <Typography variant='h6'>Payment Methods</Typography>
                <Typography variant='body2' color={'text.secondary'}>Please select a payment method</Typography>
              </Stack>

              <Stack rowGap={2}>

                <Stack flexDirection={'row'} justifyContent={'flex-start'} alignItems={'center'}>
                  <Radio value={selectedPaymentMethod} name='paymentMethod' checked={selectedPaymentMethod === 'COD'} onChange={() => setSelectedPaymentMethod('COD')} />
                  <AttachMoneyIcon sx={{ mr: 1 }} />
                  <Typography>Cash on Delivery</Typography>
                </Stack>

                <Stack flexDirection={'row'} justifyContent={'flex-start'} alignItems={'center'}>
                  <Radio value={selectedPaymentMethod} name='paymentMethod' checked={selectedPaymentMethod === 'CARD'} onChange={() => setSelectedPaymentMethod('CARD')} />
                  <PaymentIcon sx={{ mr: 1 }} />
                  <Typography>Razorpay</Typography>
                </Stack>

              </Stack>

            </Stack>
          </Stack>
        </Grid>

        {/* Right Column - Order Summary */}
        <Grid item xs={12} md={4}>
          <OrderSummarySection 
            orderTotal={orderTotal}
            cartItems={cartItems}  // Add this prop
            couponCode={couponCode}
            setCouponCode={setCouponCode}
            handleApplyCoupon={handleApplyCoupon}
            appliedCoupon={appliedCoupon}
            couponError={couponError}
            calculateDiscount={calculateDiscount}
            orderStatus={orderStatus}
            handleCreateOrder={handleCreateOrder}
            selectedPaymentMethod={selectedPaymentMethod}
          />
        </Grid>
      </Grid>
    </Container>
  );
};