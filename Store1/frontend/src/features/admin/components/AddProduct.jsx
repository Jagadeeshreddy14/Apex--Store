import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate} from 'react-router-dom'
import { addProductAsync, resetProductAddStatus, selectProductAddStatus,updateProductByIdAsync } from '../../products/ProductSlice'
import { Button, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography, useMediaQuery, useTheme, Paper } from '@mui/material'
import { useForm } from "react-hook-form"
import { selectBrands } from '../../brands/BrandSlice'
import { selectCategories, fetchAllCategoriesAsync } from '../../categories/CategoriesSlice'
import { toast } from 'react-toastify'
import { AddCategory } from '../../categories/components/AddCategory';

export const AddProduct = () => {

    const {register,handleSubmit,reset,formState: { errors }, watch } = useForm()

    const dispatch=useDispatch()
    const brands=useSelector(selectBrands)
    const categories=useSelector(selectCategories)
    const productAddStatus=useSelector(selectProductAddStatus)
    const navigate=useNavigate()
    const theme=useTheme()
    const is1100=useMediaQuery(theme.breakpoints.down(1100))
    const is480=useMediaQuery(theme.breakpoints.down(480))

    // Add state for category dialog
    const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
    const [discountedPrice, setDiscountedPrice] = useState(0);

    // Handle newly created category
    const handleCategoryCreated = (newCategory) => {
        // Refresh categories list
        dispatch(fetchAllCategoriesAsync());
    };

    useEffect(()=>{
        if(productAddStatus==='fullfilled'){
            reset()
            toast.error("Error adding product, please try again later")
        }
    },[productAddStatus])

    useEffect(()=>{
        return ()=>{
            dispatch(resetProductAddStatus())
        }
    },[])

    const handleAddProduct = (data) => {
        try {
            const price = parseFloat(data.price);
            const discountPercentage = parseFloat(data.discountPercentage) || 0;
            
            if (isNaN(price) || price < 0) {
                toast.error('Please enter a valid price');
                return;
            }
        
            if (isNaN(discountPercentage) || discountPercentage < 0 || discountPercentage > 100) {
                toast.error('Please enter a valid discount percentage (0-100)');
                return;
            }
        
            const newProduct = {
                ...data,
                price: price,
                discountPercentage: discountPercentage,
                discountedPrice: parseFloat(discountedPrice),
                stockQuantity: parseInt(data.stockQuantity) || 0,
                images: [data.image0, data.image1, data.image2, data.image3].filter(Boolean),
                isDeleted: false
            };
        
            dispatch(addProductAsync(newProduct));
        } catch (error) {
            toast.error('Error creating product');
            console.error(error);
        }
    }

    // Add this function to calculate discount price
    const calculateDiscountPrice = (price, discount) => {
        const parsedPrice = parseFloat(price);
        const parsedDiscount = parseFloat(discount);
        if (!isNaN(parsedPrice) && !isNaN(parsedDiscount)) {
            const discountAmount = parsedPrice * (parsedDiscount / 100);
            const finalPrice = parsedPrice - discountAmount;
            setDiscountedPrice(finalPrice.toFixed(2));
        }
    };

    // Add watch to monitor price and discount changes
    const price = watch('price');
    const discount = watch('discountPercentage');

    // Update discounted price when price or discount changes
    useEffect(() => {
        calculateDiscountPrice(price, discount);
    }, [price, discount]);

  return (
    <Stack p={'0 16px'} justifyContent={'center'} alignItems={'center'} flexDirection={'row'} >
        

        <Stack width={is1100?"100%":"60rem"} rowGap={4} mt={is480?4:6} mb={6} component={'form'} noValidate onSubmit={handleSubmit(handleAddProduct)}> 
            
            {/* feild area */}
            <Stack rowGap={3}>
                <Stack>
                    <Typography variant='h6' fontWeight={400} gutterBottom>Title</Typography>
                    <TextField 
                      {...register("title", {
                        required: 'Title is required',
                        minLength: { value: 3, message: 'Title must be at least 3 characters' }
                      })}
                      error={!!errors.title}
                      helperText={errors.title?.message}
                    />
                </Stack> 

                <Stack flexDirection={'row'} >

                    <FormControl fullWidth>
                        <InputLabel id="brand-selection">Brand</InputLabel>
                        <Select {...register("brand",{required:"Brand is required"})} labelId="brand-selection" label="Brand">
                            
                            {
                                brands.map((brand)=>(
                                    <MenuItem value={brand._id}>{brand.name}</MenuItem>
                                ))
                            }

                        </Select>
                    </FormControl>


                    <Stack flexDirection={'row'} spacing={2}>
                        <FormControl fullWidth>
                            <InputLabel id="category-selection">Category</InputLabel>
                            <Select 
                                {...register("category",{required:"Category is required"})} 
                                labelId="category-selection" 
                                label="Category"
                            >
                                {categories.map((category) => (
                                    <MenuItem key={category._id} value={category._id}>
                                        {category.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Button 
                            variant="outlined"
                            onClick={(e) => {
                                e.preventDefault();
                                setOpenCategoryDialog(true);
                            }}
                        >
                            Add New Category
                        </Button>
                    </Stack>

                </Stack>


                <Stack>
                    <Typography variant='h6' fontWeight={400}  gutterBottom>Description</Typography>
                    <TextField multiline rows={4} {...register("description",{required:"Description is required"})}/>
                </Stack>

                <Stack flexDirection={'row'} spacing={2}>
                    <Stack flex={1}>
                        <Typography variant='h6' fontWeight={400}  gutterBottom>Price</Typography>
                        <TextField 
                          type="number"
                          step="0.01"
                          {...register("price", {
                            required: "Price is required",
                            min: { value: 0, message: "Price must be positive" },
                            validate: value => !isNaN(parseFloat(value)) || "Please enter a valid number"
                          })}
                          error={!!errors.price}
                          helperText={errors.price?.message}
                          onChange={(e) => calculateDiscountPrice(e.target.value, discount)}
                        />
                    </Stack>
                    <Stack flex={1}>
                        <Typography variant='h6' fontWeight={400}  gutterBottom>
                          Discount {is480 ? "%" : "Percentage"}
                        </Typography>
                        <TextField 
                          type="number"
                          step="0.01"
                          {...register("discountPercentage", {
                            required: "Discount percentage is required",
                            min: { value: 0, message: "Discount cannot be negative" },
                            max: { value: 100, message: "Discount cannot exceed 100%" },
                            validate: value => !isNaN(parseFloat(value)) || "Please enter a valid number"
                          })}
                          error={!!errors.discountPercentage}
                          helperText={errors.discountPercentage?.message}
                          onChange={(e) => calculateDiscountPrice(price, e.target.value)}
                        />
                    </Stack>
                </Stack>

                {/* Add Discounted Price Display */}
                <Stack>
                    <Typography variant='h6' fontWeight={400} gutterBottom>
                        Final Price after Discount
                    </Typography>
                    <Paper 
                        elevation={0} 
                        sx={{ 
                            p: 2, 
                            backgroundColor: 'primary.light',
                            color: 'primary.contrastText',
                            borderRadius: 1
                        }}
                    >
                        <Typography variant="h5">
                            ₹{discountedPrice}
                        </Typography>
                        {price && discount > 0 && (
                            <Typography variant="caption">
                                You save: ₹{(price - discountedPrice).toFixed(2)} ({discount}%)
                            </Typography>
                        )}
                    </Paper>
                </Stack>

                <Stack>
                    <Typography variant='h6'  fontWeight={400} gutterBottom>Stock Quantity</Typography>
                    <TextField type='number' {...register("stockQuantity",{required:"Stock Quantity is required"})}/>
                </Stack>
                <Stack>
                    <Typography variant='h6'  fontWeight={400} gutterBottom>Thumbnail</Typography>
                    <TextField {...register("thumbnail",{required:"Thumbnail is required"})}/>
                </Stack>

                <Stack>
                    <Typography variant='h6'  fontWeight={400} gutterBottom>Product Images</Typography>

                    <Stack rowGap={2}>
   
                        <TextField {...register("image0",{required:"Image is required"})}/>
                        <TextField {...register("image1",{required:"Image is required"})}/>
                        <TextField {...register("image2",{required:"Image is required"})}/>
                        <TextField {...register("image3",{required:"Image is required"})}/>
    
                    </Stack>

                </Stack>

            </Stack>

            {/* Add Category Dialog */}
            <AddCategory 
                open={openCategoryDialog}
                handleClose={() => setOpenCategoryDialog(false)}
                onCategoryCreated={handleCategoryCreated}
            />

            {/* action area */}
            <Stack flexDirection={'row'} alignSelf={'flex-end'} columnGap={is480?1:2}>
                <Button size={is480?'medium':'large'} variant='contained' type='submit'>Add Product</Button>
                <Button size={is480?'medium':'large'} variant='outlined' color='error' component={Link} to={'/admin/dashboard'}>Cancel</Button>
            </Stack>

        </Stack>

    </Stack>
  )
}
