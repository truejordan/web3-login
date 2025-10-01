import { ScrollView } from 'react-native'
import { Card } from 'heroui-native'
import { HuiText } from '@/components/hui-text'
import React from 'react'
import { useW3SuiAuth } from '@/contexts/w3SuiAuth'

const AuthConsole = () => {
  const { web3authConsole } = useW3SuiAuth()
  return (
    <Card className="flex w-full p-4">
        <Card.Body className=" text-white ">
          {/* <HuiText className="text-white py-2 mb-2">Console:</HuiText> */}
          <ScrollView className="flex h-32 p-2 border-green-200/60 bg-green-400/10 rounded-md" showsVerticalScrollIndicator={false}>
            <HuiText className="text-green-700 pb-0 ">{web3authConsole}</HuiText>
          </ScrollView>
        </Card.Body>
      </Card>
  )
}

export default AuthConsole

