import { MainLayout } from '@/app/components/wrapper'
import React from 'react'

const CustomerMainLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <MainLayout>
            {children}
        </MainLayout>
    )
}

export default CustomerMainLayout
